CREATE TABLE "soul_circle_events" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" varchar NOT NULL,
  "kind" varchar(32) NOT NULL,
  "link_id" varchar NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "read_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "soul_circle_events_user_idx" ON "soul_circle_events" USING btree ("user_id","created_at");
--> statement-breakpoint
CREATE INDEX "soul_circle_events_link_idx" ON "soul_circle_events" USING btree ("link_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "soul_circle_events_unread_unique" ON "soul_circle_events" USING btree ("user_id","kind","link_id") WHERE "read_at" IS NULL;
