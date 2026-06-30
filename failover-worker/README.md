# CSKS Failover Worker - Cutover Deploy Steps

These steps are run at cutover. Do not deploy before the Dokploy app and tunnel are live.

## Prerequisites

- Cloudflare account id: 742adba7b242b60930d34f8cafe0c230
- CLOUDFLARE_API_TOKEN set (from /home/matthew/RWS/.env.local)
- computerstoreks.com zone is in the RWS Cloudflare account
- Dokploy app for CSKS is running and healthy

## Step 1: Deploy the holding page to Cloudflare Pages

Upload the `holding-page/` directory as a Cloudflare Pages project named `csks-holding`.
The backup URL will be `https://csks-holding.pages.dev`.

Connect it to the git repo (m318m972/computer-store-ks-site, migrate-dokploy-selfhost branch,
build command: none, output dir: holding-page) so it rebuilds automatically on push.

Verify the _headers file is live: `curl -sI https://csks-holding.pages.dev/ | grep x-robots-tag`
should print `x-robots-tag: noindex`.

## Step 2: Create the KV namespace

```bash
export CLOUDFLARE_API_TOKEN=$(grep '^CLOUDFLARE_API_TOKEN=' /home/matthew/RWS/.env.local | cut -d= -f2- | tr -d "\"' \r")
export CLOUDFLARE_ACCOUNT_ID=742adba7b242b60930d34f8cafe0c230
npx wrangler@latest kv namespace create CSKS_FAILOVER_KV
```

Copy the printed namespace id and replace the placeholder in wrangler.toml:
`id = "PLACEHOLDER_REPLACE_WITH_REAL_KV_NAMESPACE_ID"`

## Step 3: Create the primary.computerstoreks.com origin path

In the Dokploy admin, add `primary.computerstoreks.com` as a domain on the CSKS app
(path /, container port 3000, no HTTPS, certificateType: none).

In the cloudflared tunnel config for CSKS, add an ingress rule for primary.computerstoreks.com
pointing to http://localhost:80, then restart the tunnel service.

Create a DNS CNAME record in Cloudflare for primary.computerstoreks.com pointing to the tunnel
id (tunnelId.cfargotunnel.com, proxied: true).

Verify: `curl -H "Host: primary.computerstoreks.com" http://localhost:80/` returns 200.

## Step 4: Deploy the Worker (routes commented out)

```bash
cd failover-worker
npx wrangler@latest deploy
```

Smoke-test the Worker directly before attaching routes:
`curl -sD - "https://csks-failover.<account>.workers.dev/" | grep x-csks-served-by`
should show `primary`.

## Step 5: Attach routes and go live

In wrangler.toml, uncomment the two `[[routes]]` blocks, then redeploy:

```bash
npx wrangler@latest deploy
```

The Worker now intercepts all computerstoreks.com and www.computerstoreks.com traffic.

## Step 6: Failover test

```bash
# Stop the tunnel to simulate an outage
systemctl --user stop csks-prod-tunnel
sleep 4
curl -sD - -o /dev/null "https://computerstoreks.com/?cb=$RANDOM" | grep x-csks-served-by
# Expect: x-csks-served-by: backup

# Restore and wait for the 30-second breaker to expire
systemctl --user start csks-prod-tunnel
sleep 35
curl -sD - -o /dev/null "https://computerstoreks.com/?cb=$RANDOM" | grep x-csks-served-by
# Expect: x-csks-served-by: primary
```

## Notes

- The backup serves the holding page, not a full site mirror. Dynamic features (contact form,
  admin panel) do not function while failed over. The holding page shows the phone number and
  address so customers can still reach the store.
- The x-robots-tag header on csks-holding.pages.dev is stripped by the Worker on the real
  domain, so primary.computerstoreks.com and the live domain are not affected.
- After any content change to the holding page, push to the git branch; Pages auto-rebuilds.
