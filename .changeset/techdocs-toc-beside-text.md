---
'@backstage/plugin-techdocs': patch
---

The TechDocs reader keeps the navigation, article, and table of contents in a centered column on large screens (matching MkDocs Material), so the TOC sits next to the text instead of the window edge. Set `--techdocs-layout-max-width` on a light-DOM ancestor if you want a wider or full-bleed layout.
