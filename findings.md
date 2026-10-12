# Findings

## 2026-09-29: Caddy and the Caddyfile

Context: deploy-hardening branch, new `Caddyfile` and `docker-compose.prod.yml`

### What I learned
- A Caddyfile is just configuration (which domains, forward to where). It does not do anything by itself; Caddy is the program that reads it and acts.
- Caddy requests a free certificate from Let's Encrypt automatically the first time a domain in the Caddyfile sees real traffic.
- Renewal is not tied to visits. Caddy tracks each certificate's expiration date in the background and renews it on its own schedule, typically about 30 days before it expires, whether or not anyone visits the site in that window.
- A certificate only works if the domain's DNS actually points at the server, since Let's Encrypt verifies ownership by reaching the domain before issuing one.

### In simple terms
A Caddyfile is like a list of instructions for a doorman (Caddy) telling him which addresses to answer for and where to send visitors. Getting a website's security certificate (the thing that makes a site show as "secure" with HTTPS) usually means manually requesting and renewing it every few months. Caddy handles that automatically in the background, on its own clock, not because someone happened to visit the site that day. Think of it like an auto-renewing passport service: it watches the expiration date and renews it ahead of time, it doesn't reissue your passport every time you cross a border.

## 2026-09-29: Rate limiting with slowapi

Context: auth-api branch, planning item 4 (rate limiting on /auth/login and POST /users), before implementation

### What I learned
- A rate limiter is a check placed in front of an endpoint that counts recent requests from a given caller and rejects the caller once they go over a threshold, instead of letting every request reach the actual login/register logic.
- slowapi keeps its counts in the running Python process's memory, keyed by something like the caller's IP address plus the route, so "5/minute per IP" means the 6th request from that IP within 60 seconds gets rejected until the window rolls forward.
- The in-memory approach only breaks down if the backend scales to multiple replicas: each replica has its own separate count, so a caller could get routed across replicas and effectively get more attempts through than the limit intends. Holdview runs a single backend container today, so this isn't an active problem.
- The token check I added earlier for onUnauthorized is a related idea: distinguishing "had a session and it stopped being valid" from "never had a session to begin with," rather than treating every 401 the same way.

### In simple terms
A rate limiter is like a bouncer that only lets someone through a door a certain number of times per minute, and turns them away once they've used up their turns. slowapi's version of this bouncer keeps its counting in the running server's own memory, which works fine as long as there's only one server. If Holdview ever runs several backend servers at once, each one would keep its own separate count and the bouncer's rule would effectively get looser than intended, but that's not a concern yet since only one backend container is running.
