# App Review access
Guest local-profile features require no account. Account-backed features use the dedicated ordinary email/password account supplied privately to the stores. Never provide the owner's Apple/Google credentials, grant an administrative role, fabricate a subscription or add reviewers to the owner allowlist.

## Complimentary content access
Approved ordinary accounts can receive time-limited complimentary Plus content through server-only SOUL_CODEX_COMPLIMENTARY_GRANTS. This general content grant is available for approved promotional and review access; the binary has no reviewer detection or alternate product behavior. Each configuration entry contains exact existing userId UUID, startsAt and expiresAt in UTC. Grants expire after at most 90 days, permit no more than 20 unique users, and reject unknown fields, malformed values, wildcards and duplicate users. Missing/deleted users, future grants and expired grants receive normal paid/Free resolution. Removal revokes the grant; the existing in-memory offline cache remains bounded to 15 minutes and never exceeds grant expiry.

Responses truthfully identify source complimentary, status complimentary_time_limited, null plan and expiry. No billing event, transaction, subscription or owner/admin permission is created. Both native and hosted consumers recognize this server-verified source and label it as complimentary, not monthly/annual billing. Deployment must precede activation; native binaries must include the matching source before full-access review certification.

## Submission gates
Verify real sign-in/sign-out, account deletion, server entitlement, native Plus content, expiry and revocation against the actual candidate. Keep credentials and configured account UUIDs outside source and logs. Provide exact navigation and confirm full content access only after qualification. Native purchases remain disabled until actual provider sandbox purchase/restore/expiry proof exists. Complimentary access does not qualify purchases.

On October 31, the Free reviewer account could not satisfy Google's mandatory full-content certification. Its credential form was left unsaved; do not claim the store access declaration is complete until the complimentary candidate is deployed and qualified.
