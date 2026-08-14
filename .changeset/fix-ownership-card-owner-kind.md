---
'@backstage/plugin-org': patch
---

Ownership card links to the catalog now include the entity kind in owner filters (for example `group:default/team-a` instead of `team-a`). This is especially visible when **Include indirect ownership** is enabled on a user page, which previously mixed kindless group names with `user:` refs.
