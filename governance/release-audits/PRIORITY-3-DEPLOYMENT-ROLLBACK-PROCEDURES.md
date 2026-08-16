# Priority 3: Deployment and Rollback Procedures

**Status**: PREPARED / NOT YET EXECUTED  
**Release Version**: `v4.0.0-rc.2`  
**Release SHA**: `2e02d1023ddeb4e453236c34f2d4d2b7f6948957`

## Goal

Prove that the exact rc.2 web/backend release can be deployed to staging, rolled back to the previous known-good deployment, and redeployed without manual repair.

This is infrastructure/deployment evidence. It does not prove mobile hardware behavior, store acceptance, or production release.

---

## Preconditions

Before execution, record:

- staging environment identifier/URL
- deployment provider/project
- exact previous known-good staging SHA or deployment ID
- credentials/access required to deploy and rollback
- expected `/health` response
- bounded core journey used for smoke testing

Do not run the rollback cycle against production unless separately authorized. This procedure is staging-first.

---

## Cycle 1: Deploy rc.2

1. Deploy exact SHA `2e02d1023ddeb4e453236c34f2d4d2b7f6948957` to staging.
2. Record deployment ID and timestamp.
3. Verify `/health`.
4. Open the application shell.
5. Run the bounded core journey:
   - create/resume a local profile
   - open a reading
   - inspect evidence/limitations
   - open timeline
   - open compatibility
   - verify normal API 404 behavior for a known missing route/resource
6. Record errors, console/server issues, or deployment warnings.

**PASS**: staging serves rc.2 and the bounded smoke completes without a blocking defect.

---

## Cycle 2: Roll back to previous known-good

1. Roll staging back using the provider's supported rollback/redeploy mechanism to the recorded previous known-good deployment/SHA.
2. Record deployment ID and timestamp.
3. Verify `/health`.
4. Verify the application shell.
5. Repeat the same bounded core journey.
6. Confirm no rc.2-only manual repair was required to restore the prior version.

**PASS**: previous known-good version is restored and passes the same smoke.

---

## Cycle 3: Redeploy rc.2

1. Redeploy exact SHA `2e02d1023ddeb4e453236c34f2d4d2b7f6948957` to staging.
2. Record deployment ID and timestamp.
3. Verify `/health`.
4. Verify the application shell.
5. Repeat the same bounded core journey.
6. Confirm no manual data repair/config drift was required after rollback.

**PASS**: rc.2 returns cleanly and passes the same smoke again.

---

## Failure rules

Priority 3 FAIL includes:

- deployment cannot reach healthy state
- rollback cannot restore the prior known-good version
- redeployment requires manual repair not described in the normal deployment contract
- health endpoint or core journey fails in any of the three states
- state/data migrations make rollback unsafe or irreversible

If any cycle fails, stop promotion and preserve the failed deployment IDs/logs before fixing anything.

---

## Receipt

Record results in `RC-2-DEPLOYMENT-RECEIPT.md`.

**Overall Priority 3 PASS** requires:

`rc.2 deploy PASS → rollback PASS → rc.2 redeploy PASS`

All three must use recorded deployment identities and the same bounded smoke criteria.
