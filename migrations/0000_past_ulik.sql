CREATE TABLE "access_code_redemptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"access_code_id" varchar NOT NULL,
	"user_id" varchar,
	"session_id" varchar,
	"redeemed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "access_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"max_uses" integer DEFAULT 1 NOT NULL,
	"uses_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "local_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"password_version" integer DEFAULT 1 NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" text,
	"name" text NOT NULL,
	"birth_date" text NOT NULL,
	"birth_time" text,
	"birth_location" text,
	"timezone" text,
	"latitude" text,
	"longitude" text,
	"data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"apple_id" text,
	"email" text,
	"first_name" text,
	"last_name" text,
	"profile_image_url" text,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"subscription_status" text,
	"subscription_plan" text,
	"subscription_ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_apple_id_unique" UNIQUE("apple_id")
);
--> statement-breakpoint
ALTER TABLE "local_users" ADD CONSTRAINT "local_users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "redemptions_user_idx" ON "access_code_redemptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "redemptions_session_idx" ON "access_code_redemptions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "redemptions_code_idx" ON "access_code_redemptions" USING btree ("access_code_id");--> statement-breakpoint
CREATE UNIQUE INDEX "access_codes_code_idx" ON "access_codes" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "local_users_email_idx" ON "local_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "profiles_user_idx" ON "profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "profiles_session_idx" ON "profiles" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_apple_idx" ON "users" USING btree ("apple_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");