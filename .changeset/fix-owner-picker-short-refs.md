---
'@backstage/plugin-catalog-react': patch
---

Fixed a crash in the catalog owner filter when the page is opened with shortened owner refs that omit the kind, such as `team-a`. Names like these are now treated as groups. This still supports older bookmarks and links; new ownership card links include the kind.
