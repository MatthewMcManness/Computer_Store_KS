/**
 * CSKS failover Worker.
 *
 * Normally proxies computerstoreks.com traffic to the Dokploy primary. If the
 * primary returns a 5xx or times out, a KV circuit-breaker trips and all
 * subsequent requests are served from the Cloudflare Pages backup for COOLDOWN_S
 * seconds. Recovery is automatic: the breaker expires and the next request probes
 * the primary again.
 *
 * Response header x-csks-served-by: primary | backup shows which path served.
 *
 * KV binding: FAILOVER_KV (namespace id set in wrangler.toml).
 * Env vars:   PRIMARY (https://primary.computerstoreks.com)
 *             BACKUP  (https://csks-holding.pages.dev)
 */

const TIMEOUT_MS = 3500
const COOLDOWN_S = 30

const ASSET_RE = /\.(css|js|mjs|png|jpe?g|webp|avif|gif|svg|ico|woff2?|ttf|otf|txt|xml|json|map)$/i

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname + url.search
    const isAsset = url.pathname.startsWith('/_next/static/') || ASSET_RE.test(url.pathname)

    // Check circuit breaker.
    let primaryDown = false
    try {
      primaryDown = (await env.FAILOVER_KV.get('primary_down')) === '1'
    } catch (_) {}

    if (!primaryDown) {
      try {
        const resp = await fetchOrigin(env.PRIMARY + path, request, isAsset, TIMEOUT_MS)
        if (resp.status < 500) {
          return tag(resp, 'primary')
        }
        throw new Error('primary status ' + resp.status)
      } catch (_) {
        // Trip the breaker; other requests skip the timeout for COOLDOWN_S seconds.
        ctx.waitUntil(
          env.FAILOVER_KV.put('primary_down', '1', { expirationTtl: COOLDOWN_S }).catch(() => {})
        )
      }
    }

    // Primary is down. Serve the backup holding page.
    // Strip x-robots-tag so the real domain stays indexable even while failed over.
    const bresp = await fetchOrigin(env.BACKUP + path, request, isAsset, TIMEOUT_MS + 4000)
    const out = new Response(bresp.body, bresp)
    out.headers.delete('x-robots-tag')
    out.headers.set('x-csks-served-by', 'backup')
    return out
  },
}

function fetchOrigin(target, request, isAsset, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const headers = new Headers(request.headers)
  headers.delete('host') // let fetch set Host from the target URL (prevents self-loop)
  const init = {
    method: request.method,
    headers,
    redirect: 'manual',
    signal: controller.signal,
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body
  }
  if (isAsset) {
    init.cf = { cacheEverything: true, cacheTtl: 31536000 }
  }
  return fetch(target, init).finally(() => clearTimeout(timer))
}

function tag(resp, who) {
  const r = new Response(resp.body, resp)
  r.headers.set('x-csks-served-by', who)
  return r
}
