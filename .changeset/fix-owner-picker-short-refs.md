---
'@backstage/plugin-catalog-react': patch
---

Fixed a crash in the catalog owner filter when the page is opened with shortened owner refs, such as those produced by the ownership card on user and group pages. Names like `team-a` are now treated as groups, matching the existing catalog filter URL format.
