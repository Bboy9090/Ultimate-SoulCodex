# Native billing session recovery

Owner screenshots show an annual TestFlight sandbox purchase completing at Apple while Soul Codex remains in verification with `authentication_required`. The earlier audit found matching verification requests returning HTTP 401. Apple completion alone does not prove a Soul Codex entitlement. Personal account identifiers are omitted.

## Implementation

iOS account, billing and access JSON calls to the configured HTTPS API use Capacitor's shared native HTTP cookie jar. Other requests retain fetch. Cookies are not copied into JavaScript storage. Apple login must survive a second server request before the account is cached; purchase and restore check the current server account before invoking StoreKit. Authentication failure exposes sign-in and guides the user to restore their existing purchase.

Server verification, account binding and finish-after-verification remain required. No production billing switches change.

## Lineage and validation boundary

Base: `223da54ffc1290accb0ca7b92d43980ff3c89fce`. The previous local-only commit `031f019` was removed by workspace maintenance before it could be pushed. This change reconstructs that reviewed implementation, with explicit no-store request handling, against the unchanged main branch. Regression tests use isolated doubles and source contracts; they do not prove real iOS cookie persistence or StoreKit qualification. Current validation results are recorded in the pull request.

## Risk, rollback and remaining evidence

Native HTTP cookie handling and logout require device validation. Revert this commit and rebuild to roll back; no schema migration is involved. The connected Mac is offline. A signed qualification build must prove sign-in, restart, restore of the existing sandbox purchase, server verification, durable Plus after restart and logout before billing readiness can be claimed.
