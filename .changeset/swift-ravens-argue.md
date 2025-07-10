---
'@backstage/plugin-techdocs-node': minor
---

Add `Cache-Control` headers for hashed minified CSS files to enable client-side caching.

This is intentionally conservative (only `*.{8hex}.min.css`, e.g. mkdocs-material's) and includes an escape hatch to adjust/disable the max-age via `techdocs.publisher.cacheControl.hashedCssTtl` for setups that post-process CSS without changing the filename hash.
