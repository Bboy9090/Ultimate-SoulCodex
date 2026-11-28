"""Offline consumer of Workshop billing projections. Never funds or charges."""
import json
import sys

FIELDS = frozenset(("schema","product","status","transactionRef","provider","environment","plan","accessStatus","settledRevenueCents","paymentFeeCents","refundCents","currency","walletFundingAuthorized","spendingAuthorized","checkoutEnabledByBridge"))
STATUSES = frozenset(("active","trialing","grace_period","canceled_pending_expiry","expired","revoked","refunded","account_hold"))

def reconcile(records):
    if not isinstance(records,list) or len(records)>10000:
        raise ValueError("bounded projection list required")
    seen = {}
    invalid = sandbox = pending = 0
    for record in records:
        if not isinstance(record,dict) or set(record)!=FIELDS:
            raise ValueError("unexpected projection fields")
        if record["schema"]!="workshop.billing-reconciliation.v1" or record["product"]!="soul-codex":
            raise ValueError("unsupported projection schema or product")
        if any(record[k] is not None for k in ("settledRevenueCents","paymentFeeCents","refundCents","currency")):
            raise ValueError("lifecycle projection cannot establish money amounts")
        if any(record[k] is not False for k in ("walletFundingAuthorized","spendingAuthorized","checkoutEnabledByBridge")):
            raise ValueError("projection cannot authorize financial effects")
        if record["status"]=="INVALID_LINKAGE":
            if any(record[k] is not None for k in ("transactionRef","provider","environment","plan","accessStatus")):
                raise ValueError("invalid linkage must redact identifiers")
            invalid+=1
            continue
        env=record["environment"]
        if env not in ("sandbox","production") or record["status"]!=("SANDBOX_ONLY" if env=="sandbox" else "SETTLEMENT_REQUIRED"):
            raise ValueError("environment/status mismatch")
        ref=record["transactionRef"]
        if not isinstance(ref,str) or not ref.strip() or len(ref)>512:
            raise ValueError("invalid transaction reference")
        if record["provider"] not in ("stripe","apple","google_play") or record["plan"] not in ("monthly","annual") or record["accessStatus"] not in STATUSES:
            raise ValueError("unsupported lifecycle metadata")
        key=(record["provider"],env,ref)
        if key in seen:
            if seen[key]!=record: raise ValueError("conflicting projection replay")
            continue
        seen[key]=record
        if env=="sandbox": sandbox+=1
        else: pending+=1
    return {"status":"BLOCKED_PENDING_SETTLEMENT" if pending or invalid else "NO_PRODUCTION_SETTLEMENT_EVIDENCE",
            "productionEventsPending":pending,"sandboxEventsExcluded":sandbox,
            "invalidLinkageRecords":invalid,"settledRevenueCents":None,
            "paymentFeeCents":None,"refundCents":None,"walletFundingAuthorized":False,
            "spendingAuthorized":False,"checkoutEnabledByBridge":False}

def unique_pairs(pairs):
    out={}
    for key,value in pairs:
        if key in out: raise ValueError("duplicate JSON key")
        out[key]=value
    return out

if __name__=="__main__":
    try:
        result=reconcile(json.load(sys.stdin,object_pairs_hook=unique_pairs))
        print(json.dumps(result,sort_keys=True))
    except (ValueError,TypeError) as exc:
        print(json.dumps({"status":"REJECTED","error":str(exc),"spendingAuthorized":False,"walletFundingAuthorized":False}))
        sys.exit(2)
