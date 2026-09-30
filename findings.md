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
