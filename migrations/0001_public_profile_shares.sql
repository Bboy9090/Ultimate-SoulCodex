CREATE TABLE "public_profile_shares" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "token" varchar(96) NOT NULL,
  "profile_id" varchar NOT NULL,
  "snapshot" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "revoked_at" timestamp,
  CONSTRAINT "public_profile_shares_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE INDEX "public_profile_shares_profile_idx" ON "public_profile_shares" USING btree ("profile_id");
