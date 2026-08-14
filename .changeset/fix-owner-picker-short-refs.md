---
'@backstage/plugin-catalog-react': patch
---

Fixed a crash in the catalog owner filter when opened with owner refs that omit the kind, such as `team-a`. These are now treated as groups.
