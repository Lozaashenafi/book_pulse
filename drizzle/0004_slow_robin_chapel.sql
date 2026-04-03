CREATE TABLE "review_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "book_reviews" ADD COLUMN "share_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "review_shares" ADD CONSTRAINT "review_shares_review_id_book_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."book_reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_shares" ADD CONSTRAINT "review_shares_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;