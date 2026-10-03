CREATE TABLE "billing_subjects" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "billing_subjects_user_unique"
  ON "billing_subjects" ("user_id");
--> statement-breakpoint
CREATE TABLE "billing_transaction_events" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "billing_subject_id" varchar NOT NULL,
  "provider" text NOT NULL,
  "provider_event_id" text NOT NULL,
  "provider_transaction_id" text,
  "product_id" text NOT NULL,
  "plan" text NOT NULL,
  "environment" text NOT NULL,
  "event_type" text NOT NULL,
  "verification_state" text NOT NULL,
  "purchased_at" timestamp,
  "expires_at" timestamp,
  "verified_at" timestamp NOT NULL,
  "evidence_digest" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "billing_transaction_events_provider_event_unique"
  ON "billing_transaction_events" ("provider", "provider_event_id");
--> statement-breakpoint
CREATE INDEX "billing_transaction_events_subject_idx"
  ON "billing_transaction_events" ("billing_subject_id");
--> statement-breakpoint
CREATE TABLE "entitlement_grants" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "billing_subject_id" varchar NOT NULL,
  "capability" text NOT NULL,
  "plan" text NOT NULL,
  "source_provider" text NOT NULL,
  "source_transaction_event_id" varchar NOT NULL,
  "status" text NOT NULL,
  "effective_at" timestamp NOT NULL,
  "expires_at" timestamp,
  "revoked_at" timestamp,
  "last_verified_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "entitlement_grants_subject_capability_idx"
  ON "entitlement_grants" ("billing_subject_id", "capability");
--> statement-breakpoint
CREATE UNIQUE INDEX "entitlement_grants_source_event_unique"
  ON "entitlement_grants" ("source_transaction_event_id", "capability");
--> statement-breakpoint
CREATE TABLE "billing_verification_receipts" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "transaction_event_id" varchar NOT NULL,
  "provider" text NOT NULL,
  "verification_state" text NOT NULL,
  "evidence_digest" text NOT NULL,
  "diagnostic_metadata" jsonb NOT NULL,
  "verified_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "billing_verification_receipts_transaction_idx"
  ON "billing_verification_receipts" ("transaction_event_id");
