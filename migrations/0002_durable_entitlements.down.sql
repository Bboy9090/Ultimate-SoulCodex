-- Rollback for 0002_durable_entitlements.sql.
-- Disable billing writes and verify no dependent release is active before rollback.
DROP TABLE IF EXISTS billing_verification_receipts;
DROP TABLE IF EXISTS entitlement_grants;
DROP TABLE IF EXISTS store_transaction_events;
DROP TABLE IF EXISTS billing_subjects;
