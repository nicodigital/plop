# google-tag-manager-csp.md — portable GTM + Google Ads under a strict CSP

How to load Google Tag Manager (and, through it, GA4 and Google Ads) on a
site that ships a strict, hash-based Content-Security-Policy, without falling
back to `'unsafe-inline'` or `'unsafe-eval'`. Written so it can be applied to
a **new** Astro project without reading anything else in this repository.

The reference implementation is `astro.config.mjs` (`security.csp`) and the
`<head>` of `src/layouts/BaseLayout.astro`. The only project-specific parts
are the container id (`GTM-…`) and the country TLD (`google.com.br`).

Source of truth for the host lists:
https://developers.google.com/tag-platform/security/guides/csp — re-check it
when adding a Google product; Google changes endpoints without notice.

---

## 1. The idea in one paragraph

GTM is a script loader: the container you publish in the GTM dashboard
decides at runtime which Google tags run, and each tag talks to its own set
of domains. A strict CSP therefore breaks GTM **silently and piecemeal** —
the container loads, but a conversion ping or a beacon is refused, and GTM's
diagnostics report "La política de seguridad de contenido (CSP) bloquea…".
The fix is never "turn the CSP off". It is: load the container snippet from
`'self'` so it needs no nonce, then allow exactly the hosts each product in
the container uses, per directive.

---

## 2. Where the CSP lives (check first)

Find the policy before editing anything. In this project it is **not** an
HTTP header: Astro (≥ 5.9, `security.csp`) emits it per page as a
`<meta http-equiv="content-security-policy">` carrying the hashes of its own
scripts and styles. A `_headers` file, a Worker, a CDN rule or a server
config are the other usual places. If two policies apply, the browser
enforces **both**, so a host must be allowed in every one.

Verify what production actually serves, not what the repo says:

```bash
curl -s https://example.com/ | grep -o '<meta http-equiv="content-security-policy"[^>]*>'
# or, for a header policy:
curl -sI https://example.com/ | grep -i content-security-policy
```

---

## 3. The container snippet

Google's stock snippet is an inline IIFE, which a hash/nonce CSP blocks.
Split it into an external script plus a bundled one:

```astro
<!-- in <head>, once, in the base layout -->
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
</script>
```

- The first tag has an attribute besides `src`, so Astro leaves it as-is; it
  is covered by `https://*.googletagmanager.com` in `script-src`.
- The second tag is processed and bundled by Astro, so it is served from
  `'self'` (or hashed automatically) — no nonce, no `'unsafe-inline'`.
- **The `gtm.js` event is required.** Without it the container loads but the
  "All Pages" / "Initialization" triggers never fire. A leftover
  `gtag('js', new Date())` from a gtag.js snippet is *not* a substitute.
- Do not also load `gtag/js?id=AW-…` or `G-…` directly once GTM is in place:
  configure the Google Ads and GA4 tags *inside* the container, or they fire
  twice. When removing a direct `AW-` snippet, confirm the conversion tag
  exists in GTM first, or conversion tracking stops.
- The `<noscript><iframe>` fallback is optional; if kept, `frame-src` needs
  `https://www.googletagmanager.com` (already in §4).
- If the page declares a typed `window.dataLayer` (TypeScript), push objects
  to it directly; there is no need for a global `gtag()` function.

---

## 4. Directives

Merge these into the existing policy; keep every source the site already
needs (`'self'`, Turnstile, analytics beacons injected at the edge, …).
Wildcards in CSP match any subdomain depth (`*.doubleclick.net` covers
`ad.`, `td.`, `googleads.g.`), but **there is no TLD wildcard**: each
`google.<TLD>` used by the audience's country must be listed by hand
(`google.com.br` for Brazil; list: https://www.google.com/supported_domains).

| Directive | Sources | Needed by |
|---|---|---|
| `script-src` | `https://*.googletagmanager.com` `https://www.googleadservices.com` `https://googleads.g.doubleclick.net` `https://www.google.com` `https://tagmanager.google.com` | GTM, Ads conversion/remarketing, Preview mode |
| `img-src` | `https://*.google-analytics.com` `https://*.googletagmanager.com` `https://*.doubleclick.net` `https://*.google.com` `https://*.google.<TLD>` `https://www.googleadservices.com` `https://pagead2.googlesyndication.com` `https://ssl.gstatic.com` `https://www.gstatic.com` | GA4 & Ads pixels, Preview mode |
| `connect-src` | `https://*.google-analytics.com` `https://*.analytics.google.com` `https://*.googletagmanager.com` `https://*.doubleclick.net` `https://*.google.com` `https://*.google.<TLD>` `https://www.googleadservices.com` `https://pagead2.googlesyndication.com` | GA4 & Ads beacons, user-provided data |
| `frame-src` | `https://www.googletagmanager.com` `https://td.doubleclick.net` | Ads, Conversion Linker, noscript fallback |
| `style-src` | `https://www.googletagmanager.com` `https://tagmanager.google.com` `https://fonts.googleapis.com` | Preview mode badge only |
| `font-src` | `data:` `https://fonts.gstatic.com` | Preview mode badge only |

`ad.doubleclick.net` is the one that most often slips through: it is the
Ads conversion endpoint and is **not** covered by `*.g.doubleclick.net`.
In practice, GTM's diagnostic listed `www.google.com` next to it even though
that host was already allowed; allowing `ad.doubleclick.net` cleared both.

Products not covered above add their own hosts (see the Google guide):
Floodlight (`ade.googlesyndication.com`, `adservice.google.com`,
`frame-src https://*.fls.doubleclick.net`), Merchant Center
(`*.merchant-center-analytics.goog`), server-side tagging / tag gateway
(the tagging server origin, plus `worker-src`).

### Astro reference (`astro.config.mjs`)

```js
export default defineConfig({
  security: {
    csp: {
      algorithm: "SHA-256",
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com https://*.doubleclick.net https://*.google.com https://*.google.com.br https://www.googleadservices.com https://pagead2.googlesyndication.com https://ssl.gstatic.com https://www.gstatic.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.doubleclick.net https://*.google.com https://*.google.com.br https://www.googleadservices.com https://pagead2.googlesyndication.com",
        "frame-src https://td.doubleclick.net https://www.googletagmanager.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: {
        resources: [
          "'self'",
          "https://*.googletagmanager.com",
          "https://www.googleadservices.com",
          "https://googleads.g.doubleclick.net",
          "https://www.google.com",
          "https://tagmanager.google.com",
        ],
      },
      styleDirective: {
        resources: [
          "'self'",
          "https://www.googletagmanager.com",
          "https://tagmanager.google.com",
          "https://fonts.googleapis.com",
        ],
      },
    },
  },
});
```

`script-src` and `style-src` go in `scriptDirective` / `styleDirective`, not
in `directives`: those are the two Astro builds itself, appending the hashes
of its own scripts and styles.

---

## 5. What stays blocked on purpose

- **Custom HTML tags** in GTM inject inline `<script>`, which a hash-based
  CSP refuses. Use the built-in tag templates (GA4, Google Ads, Conversion
  Linker) or a Custom Template instead.
- **Custom JavaScript variables** need `'unsafe-eval'` and evaluate to
  `undefined` without it. Google's own recommendation is Custom Templates.
  Add `'unsafe-eval'` only with an explicit decision; it weakens the policy
  for the whole site.
- Never "solve" a violation with `'unsafe-inline'` in `script-src`. If a
  nonce is truly needed (SSR pages), GTM propagates it to the scripts it
  adds — but a static site cannot mint a per-response nonce.

---

## 6. Event bus (optional, recommended)

Components should not know vendor ids. Dispatch provider-agnostic names to
`dataLayer` and map them to GA4 events / Ads conversions inside GTM with
"Custom Event" triggers. Reference: `src/scripts/analytics.ts`
(`track(name, payload)` → `window.dataLayer.push({ event: name, ...payload })`,
plus declarative `data-track="…"` attributes). Fire a conversion event only
after the server confirms success (e.g. a form's 2xx), never on click.

---

## 7. Verification checklist

1. `astro build`, then read the emitted policy:
   `grep -o "connect-src[^;]*" dist/index.html`.
2. Deploy, then confirm production serves the same policy (§2 `curl`).
3. Open the site with DevTools → Console, filter for
   `violates the following Content Security Policy directive`. Each line
   names the directive and the blocked host: add that host to that directive.
4. GTM → Preview (Tag Assistant): the container connects, tags fire on
   "Container Loaded", and **Page issues** shows no CSP entry.
5. Google Ads → the conversion action's status turns active after a real
   conversion is recorded.
6. Test in a private window too: consent banners and ad blockers change
   which requests are made, and a cached old policy can mask a fix.
