---
'@backstage/plugin-catalog': patch
---

The catalog entity presentation API no longer throws when given an entity reference that omits the kind, for example `team-a`. When a default kind is provided it is used to complete the reference; otherwise the original string is shown as the title.
