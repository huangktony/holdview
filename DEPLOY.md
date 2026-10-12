# Deploying Holdview

Runbook for the live server. Last verified 2026-10-12. Everything below was run
against the real server, except where it says "not done yet".

## What is running

- One EC2 instance (`t3.micro`, Ubuntu, `us-east-1`), 1 GB RAM plus a 1 GB swap
  file, 16 GB disk.
- Three containers from `docker-compose.yml`: Postgres (`db`), the FastAPI app
  (`backend`, port 8000) and nginx serving the built React app (`frontend`,
  port 5174). Plain http, no HTTPS yet.
- The repo lives at `/home/ubuntu/holdview` on the server.
- The server has Docker Compose **v1** (`docker-compose`, with a hyphen), not
  v2 (`docker compose`).
- Database data lives in the named volume `holdview_pgdata`. It survives
  rebuilds and recreates.

## Connect

```
ssh holdview
```

The alias is in `~/.ssh/config` (user `ubuntu`, key in `~/.ssh/aws-keys/`).

If it hangs with `Operation timed out`, your public IP changed and the security
group only allows specific addresses on port 22. Allow the new one:

```
curl https://checkip.amazonaws.com
aws ec2 authorize-security-group-ingress --region us-east-1 \
  --group-id <SG_ID> --protocol tcp --port 22 --cidr <YOUR_IP>/32
```

Never open port 22 to `0.0.0.0/0`. Remove old addresses with
`revoke-security-group-ingress` and the same arguments.

Use plain `ssh` only. Do not use VS Code Remote on this server. Its helper
process uses several hundred MB, and on 1 GB of RAM it caused an out-of-memory
hang and a full disk.

## Server settings (`.env`)

`/home/ubuntu/holdview/.env` is not in git and must exist before any deploy.
Keys (see `.env.example`): `SECRET_KEY`, `POSTGRES_USER`, `POSTGRES_PASSWORD`,
`POSTGRES_DB`, `BACKEND_URL`, `FRONTEND_ORIGINS`.

- `BACKEND_URL` is baked into the frontend at **build** time. Changing it needs
  a rebuild, not just a restart.
- `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB` must match what the
  existing database volume was created with. Postgres only reads them when it
  creates an empty volume. Changing them later does not change the database.
- Keep it owner-only (`chmod 600 .env`) and never print it.

## Routine deploy

Push to `main` first, then on the server:

```
ssh holdview
cd /home/ubuntu/holdview
git pull --ff-only
docker-compose -f docker-compose.yml up -d --build
```

Always pass `-f docker-compose.yml`. Without it, Compose also loads
`docker-compose.override.yml` (the local dev file), which adds `--reload`, a
source bind mount and a published database port.

Expect 2 to 5 minutes where the site is down or flaky while images rebuild.
The frontend build is the slow, memory-heavy step.

If a release adds a database migration, run it after the containers are up:

```
docker-compose -f docker-compose.yml exec -T backend uv run alembic upgrade head
```

## Verify after every deploy

```
docker-compose -f docker-compose.yml ps
curl -s -o /dev/null -w "root: %{http_code}\n" http://localhost:8000/
curl -s -o /dev/null -w "GET /users: %{http_code}\n" http://localhost:8000/users
curl -s -o /dev/null -w "frontend: %{http_code}\n" http://localhost:5174/
docker-compose -f docker-compose.yml exec -T backend uv run alembic current
```

Expected: all three containers `Up` (db `healthy`), `root: 200`,
`GET /users: 405` (the route no longer exists), `frontend: 200`, and
`alembic current` printing the latest revision with `(head)`.

Then load `http://<server-ip>:5174` in a browser. A server-side `200` does not
prove the public path works. The security group has to allow the port too.

## When something goes wrong

**Compose leaves containers stuck** (`Exit 0`, names with a hex prefix such as
`cffcb3a96fca_holdview_db_1`, and no running replacement). This is a Compose v1
recreate failure. Tear down and start fresh:

```
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up -d --build
```

`down` keeps `holdview_pgdata`. **Never add `-v` or `--volumes`** to `down`,
and never run `docker system prune --volumes`. Those delete the database.

**Build fails with `no permission to read ... __pycache__`.** Files written by a
container running as root. Hand them back, which deletes nothing:

```
sudo chown -R ubuntu:ubuntu /home/ubuntu/holdview
```

**Site loads on the server but not from your browser.** Check the security group
has a rule for the port (5174 for the site, 8000 for the API):

```
aws ec2 describe-security-groups --region us-east-1 --group-ids <SG_ID> \
  --query 'SecurityGroups[0].IpPermissions[].[FromPort,IpRanges[].CidrIp]' --output text
aws ec2 authorize-security-group-ingress --region us-east-1 \
  --group-id <SG_ID> --protocol tcp --port 5174 --cidr 0.0.0.0/0
```

**SSH banner timeout while the app is also down.** The instance is likely out of
memory. AWS status checks still say "ok", because they do not look inside the
OS. Wait a few minutes. If it does not recover, reboot from AWS
(`aws ec2 reboot-instances`, which keeps the public IP). The containers have
`restart: unless-stopped` and come back on their own.

**Disk full** (`No space left on device`). Safe cleanup, in this order:

```
docker image prune -a -f
sudo apt-get clean
sudo journalctl --vacuum-size=100M
df -h /
```

## Before risky changes

Take a volume snapshot first (disk resize, OS upgrades, anything that touches
the database volume):

```
aws ec2 create-snapshot --region us-east-1 --volume-id <VOLUME_ID> \
  --description "before <what you are about to do>"
```

Wait for the state to be `completed` before starting.

## Known gaps (not done yet)

- **No HTTPS.** `docker-compose.prod.yml` and the `Caddyfile` exist but are not
  applied. They need DNS A records for two domains, ports 80 and 443 open, and
  Compose v2 on the server (`!reset` in the prod file does not parse on v1).
  Until then the site and API are plain http on ports 5174 and 8000.
- **Rate limiting.** `TRUST_PROXY_HEADERS=1` is set only in the prod compose
  file, because it is safe only when Caddy is the sole way to reach the backend.
  Today the limiter keys on the direct connection address.
- **Uploaded PDFs** now go to the named volume `uploads` (mounted at
  `/app/uploads`), so they survive rebuilds. This takes effect at the first
  deploy after it was added. PDFs uploaded before that live only in the old
  container.
- **Database password** is short and should be rotated.
- **Backups.** Only manual snapshots. No scheduled backup of `holdview_pgdata`.
