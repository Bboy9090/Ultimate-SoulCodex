import unittest
from workshop_billing_reconciliation import reconcile

def fixture(**changes):
    row=dict(schema="workshop.billing-reconciliation.v1",product="soul-codex",status="SETTLEMENT_REQUIRED",transactionRef="synthetic-event",provider="stripe",environment="production",plan="monthly",accessStatus="active",settledRevenueCents=None,paymentFeeCents=None,refundCents=None,currency=None,walletFundingAuthorized=False,spendingAuthorized=False,checkoutEnabledByBridge=False)
    return row|changes

class ReconciliationTests(unittest.TestCase):
    def test_subscription_no_revenue_or_funds(self):
        result=reconcile([fixture()])
        self.assertEqual(result["productionEventsPending"],1)
        self.assertIsNone(result["settledRevenueCents"])
        self.assertIs(result["walletFundingAuthorized"],False)
    def test_sandbox_excluded(self):
        r=reconcile([fixture(environment="sandbox",status="SANDBOX_ONLY")])
        self.assertEqual(r["productionEventsPending"],0)
        self.assertEqual(r["sandboxEventsExcluded"],1)
    def test_exact_retry_deduplicated(self):
        self.assertEqual(reconcile([fixture(),fixture()])["productionEventsPending"],1)
    def test_conflicting_retry_rejected(self):
        with self.assertRaises(ValueError): reconcile([fixture(),fixture(accessStatus="refunded")])
    def test_unknown_refund_amount_not_zero(self):
        self.assertIsNone(reconcile([fixture(accessStatus="refunded")])["refundCents"])
    def test_injected_money_and_authorization_rejected(self):
        for k,v in (("settledRevenueCents",0),("currency","USD"),("spendingAuthorized",True),("walletFundingAuthorized",True),("checkoutEnabledByBridge",True)):
            with self.subTest(key=k),self.assertRaises(ValueError): reconcile([fixture(**{k:v})])
    def test_wrong_environment_rejected(self):
        with self.assertRaises(ValueError): reconcile([fixture(environment="sandbox")])
    def test_invalid_linkage_redacted(self):
        r=reconcile([fixture(status="INVALID_LINKAGE",transactionRef=None,provider=None,environment=None,plan=None,accessStatus=None)])
        self.assertEqual(r["invalidLinkageRecords"],1)
        self.assertEqual(r["productionEventsPending"],0)
    def test_unknown_extra_fields_rejected(self):
        with self.assertRaises(ValueError): reconcile([fixture(rawToken="synthetic")])
    def test_empty_not_zero_revenue(self):
        self.assertIsNone(reconcile([])["settledRevenueCents"])

if __name__=="__main__":
    unittest.main()
