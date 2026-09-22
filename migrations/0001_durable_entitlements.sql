CREATE TABLE "billing_subjects" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"status" text DEFAULT 'active' NOT NULL,
	"anonymized_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_transaction_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"billing_subject_id" varchar NOT NULL,
	"provider" text NOT NULL,
	"environment" text NOT NULL,
	"external_transaction_id" text NOT NULL,
	"original_transaction_id" text,
	"product_id" text NOT NULL,
	"event_type" text NOT NULL,
	"purchase_status" text NOT NULL,
	"purchased_at" timestamp,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"payload_digest" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entitlement_grants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"billing_subject_id" varchar NOT NULL,
	"capability" text NOT NULL,
	"source_event_id" varchar NOT NULL,
	"status" text NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp,
	"revoked_at" timestamp,
	"last_verified_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_verification_receipts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"store_event_id" varchar NOT NULL,
	"provider_event_id" text NOT NULL,
	"verifier" text NOT NULL,
	"outcome" text NOT NULL,
	"reason_code" text,
	"payload_digest" text NOT NULL,
	"verified_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "store_transaction_events" ADD CONSTRAINT "store_transaction_events_billing_subject_id_billing_subjects_id_fk" FOREIGN KEY ("billing_subject_id") REFERENCES "public"."billing_subjects"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "entitlement_grants" ADD CONSTRAINT "entitlement_grants_billing_subject_id_billing_subjects_id_fk" FOREIGN KEY ("billing_subject_id") REFERENCES "public"."billing_subjects"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "entitlement_grants" ADD CONSTRAINT "entitlement_grants_source_event_id_store_transaction_events_id_fk" FOREIGN KEY ("source_event_id") REFERENCES "public"."store_transaction_events"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "billing_verification_receipts" ADD CONSTRAINT "billing_verification_receipts_store_event_id_store_transaction_events_id_fk" FOREIGN KEY ("store_event_id") REFERENCES "public"."store_transaction_events"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "billing_subjects_user_id_uidx" ON "billing_subjects" USING btree ("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "store_events_provider_transaction_uidx" ON "store_transaction_events" USING btree ("provider", "environment", "external_transaction_id");
--> statement-breakpoint
CREATE INDEX "store_events_subject_idx" ON "store_transaction_events" USING btree ("billing_subject_id");
--> statement-breakpoint
CREATE INDEX "store_events_original_transaction_idx" ON "store_transaction_events" USING btree ("original_transaction_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "entitlement_grants_subject_capability_uidx" ON "entitlement_grants" USING btree ("billing_subject_id", "capability");
--> statement-breakpoint
CREATE INDEX "entitlement_grants_source_event_idx" ON "entitlement_grants" USING btree ("source_event_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "billing_receipts_provider_event_uidx" ON "billing_verification_receipts" USING btree ("provider_event_id");
--> statement-breakpoint
CREATE INDEX "billing_receipts_store_event_idx" ON "billing_verification_receipts" USING btree ("store_event_id");
