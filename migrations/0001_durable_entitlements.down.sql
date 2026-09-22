-- Rollback for 0001_durable_entitlements.sql.
-- Run only after disabling billing writes and confirming no dependent release
-- is still using the entitlement tables.
DROP TABLE IF EXISTS billing_verification_receipts;
DROP TABLE IF EXISTS entitlement_grants;
DROP TABLE IF EXISTS store_transaction_events;
DROP TABLE IF EXISTS billing_subjects;
