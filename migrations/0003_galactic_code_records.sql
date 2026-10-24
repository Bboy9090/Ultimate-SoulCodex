CREATE TABLE "galactic_code_records" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "profile_id" varchar NOT NULL,
  "user_id" varchar,
  "session_id" varchar,
  "revision" varchar(64) NOT NULL,
  "version" text NOT NULL,
  "result" jsonb NOT NULL,
  "generated_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "galactic_code_records_profile_unique" ON "galactic_code_records" USING btree ("profile_id");
--> statement-breakpoint
CREATE INDEX "galactic_code_records_owner_idx" ON "galactic_code_records" USING btree ("user_id","session_id");
