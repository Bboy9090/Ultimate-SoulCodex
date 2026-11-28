import assert from "node:assert/strict";
import test from "node:test";
import { projectWorkshopBillingEvidence } from "../server/lib/workshop-profit-evidence.ts";

const transaction = {
  id:"synthetic-event", billingSubjectId:"synthetic-subject", provider:"stripe",
  environment:"production", plan:"monthly", verificationState:"verified", evidenceDigest:"a".repeat(64),
};
const receipt = {
  transactionEventId:transaction.id, provider:transaction.provider,
  verificationState:"verified", evidenceDigest:transaction.evidenceDigest,
  diagnosticMetadata:{synthetic:"private fixture not exported"},
};
const grant = {
  sourceTransactionEventId:transaction.id, billingSubjectId:transaction.billingSubjectId,
  sourceProvider:transaction.provider, plan:transaction.plan, capability:"soul_codex_plus", status:"active",
};
const project=(t=transaction,r=receipt,g=grant)=>projectWorkshopBillingEvidence(t,r,g);

test("production lifecycle evidence is not settled revenue or funded credit",()=>{
  const result=project();
  assert.equal(result.status,"SETTLEMENT_REQUIRED");
  for (const key of ["settledRevenueCents","paymentFeeCents","refundCents","currency"]) assert.equal(result[key],null);
  for (const key of ["walletFundingAuthorized","spendingAuthorized","checkoutEnabledByBridge"]) assert.equal(result[key],false);
  assert.equal(result.transactionRef,transaction.id);
  assert.doesNotMatch(JSON.stringify(result),/synthetic-subject|private fixture/);
});
test("sandbox cannot be recognized as production revenue",()=>{
  const result=project({...transaction,environment:"sandbox"});
  assert.equal(result.status,"SANDBOX_ONLY");
  assert.equal(result.settledRevenueCents,null);
  assert.equal(result.walletFundingAuthorized,false);
});
test("refund and cancellation state do not establish refund amount",()=>{
  for (const status of ["refunded","revoked","canceled_pending_expiry","expired","trialing"]) {
    const result=project(transaction,receipt,{...grant,status});
    assert.equal(result.accessStatus,status);
    assert.equal(result.refundCents,null);
    assert.equal(result.spendingAuthorized,false);
  }
});
test("invalid event, receipt, subject, provider and digest links fail closed",()=>{
  const bad=[
    project({...transaction,verificationState:"unverified"}),
    project(transaction,{...receipt,verificationState:"unverified"}),
    project(transaction,{...receipt,transactionEventId:"other"}),
    project(transaction,{...receipt,provider:"apple"}),
    project(transaction,{...receipt,evidenceDigest:"b".repeat(64)}),
    project(transaction,receipt,{...grant,sourceTransactionEventId:"other"}),
    project(transaction,receipt,{...grant,billingSubjectId:"other"}),
    project(transaction,receipt,{...grant,sourceProvider:"apple"}),
    project(transaction,receipt,{...grant,plan:"annual"}),
    project(transaction,receipt,{...grant,capability:"other"}),
    project({...transaction,environment:"unknown"}),
  ];
  for(const result of bad) {
    assert.equal(result.status,"INVALID_LINKAGE");
    assert.equal(result.transactionRef,null);
    assert.equal(result.walletFundingAuthorized,false);
    assert.equal(result.spendingAuthorized,false);
  }
});
test("identical stored event projects deterministically on retry",()=>{
  assert.deepEqual(project(),project());
});
test("all existing providers retain the reconciliation-only boundary",()=>{
  for(const provider of ["stripe","apple","google_play"]) {
    const result=project({...transaction,provider},{...receipt,provider},{...grant,sourceProvider:provider});
    assert.equal(result.status,"SETTLEMENT_REQUIRED");
    assert.equal(result.provider,provider);
    assert.equal(result.settledRevenueCents,null);
  }
});

test("actual TypeScript projection crosses the Python reconciliation boundary without funding", async()=>{
  const {spawnSync}=await import("node:child_process");
  const live=project();
  const sandbox=project({...transaction,environment:"sandbox"});
  const child=spawnSync("python3",["scripts/workshop_billing_reconciliation.py"],{
    input:JSON.stringify([live,live,sandbox]),encoding:"utf8",timeout:10000
  });
  assert.equal(child.error,undefined);
  assert.equal(child.status,0,child.stderr);
  const result=JSON.parse(child.stdout);
  assert.equal(result.productionEventsPending,1);
  assert.equal(result.sandboxEventsExcluded,1);
  assert.equal(result.settledRevenueCents,null);
  assert.equal(result.walletFundingAuthorized,false);
  assert.equal(result.spendingAuthorized,false);
});
