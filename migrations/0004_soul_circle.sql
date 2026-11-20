CREATE TABLE "soul_circle_invites" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "token_hash" varchar(64) NOT NULL,
  "inviter_user_id" varchar NOT NULL,
  "inviter_display_name" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "expires_at" timestamp NOT NULL,
  "accepted_by_user_id" varchar,
  "accepted_at" timestamp,
  "revoked_at" timestamp,
  CONSTRAINT "soul_circle_invites_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE INDEX "soul_circle_invites_inviter_idx" ON "soul_circle_invites" USING btree ("inviter_user_id");
--> statement-breakpoint
CREATE TABLE "soul_circle_links" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_low_id" varchar NOT NULL,
  "user_high_id" varchar NOT NULL,
  "status" varchar(16) DEFAULT 'active' NOT NULL,
  "blocked_by_user_id" varchar,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "soul_circle_links_pair_unique" ON "soul_circle_links" USING btree ("user_low_id","user_high_id");
--> statement-breakpoint
CREATE INDEX "soul_circle_links_high_idx" ON "soul_circle_links" USING btree ("user_high_id");
--> statement-breakpoint
CREATE TABLE "soul_circle_shares" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "owner_user_id" varchar NOT NULL,
  "friend_user_id" varchar NOT NULL,
  "selection" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "expires_at" timestamp NOT NULL,
  "revoked_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "soul_circle_shares_pair_unique" ON "soul_circle_shares" USING btree ("owner_user_id","friend_user_id");
--> statement-breakpoint
CREATE INDEX "soul_circle_shares_friend_idx" ON "soul_circle_shares" USING btree ("friend_user_id");
