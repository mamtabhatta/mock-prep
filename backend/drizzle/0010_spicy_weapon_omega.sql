CREATE TABLE IF NOT EXISTS "session_documents" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "session_id" uuid NOT NULL,
    "document_type" text NOT NULL,
    "file_url" text NOT NULL,
    "extracted_text" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session_questions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "session_id" uuid NOT NULL,
    "question_id" uuid,
    "text" text NOT NULL,
    "type" "question_type",
    "order_index" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session_answers" DROP CONSTRAINT IF EXISTS "session_answers_question_id_questions_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_documents" ADD CONSTRAINT "session_documents_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_questions" ADD CONSTRAINT "session_questions_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_questions" ADD CONSTRAINT "session_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_documents_session_idx" ON "session_documents" ("session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_questions_session_idx" ON "session_questions" ("session_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_questions_session_order_idx" ON "session_questions" ("session_id", "order_index");
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session_answers" ADD CONSTRAINT "session_answers_question_id_session_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."session_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
