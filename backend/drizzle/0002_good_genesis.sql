DO $$ BEGIN
 CREATE TYPE "public"."course_track" AS ENUM('admission', 'visa');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."difficulty" AS ENUM('1', '2', '3', '4', '5');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."frequency" AS ENUM('almost_always', 'common', 'occasional');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."interview_format" AS ENUM('mmi', 'panel', 'portfolio', 'one_on_one', 'none');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."question_type" AS ENUM('motivational', 'subject_knowledge', 'situational', 'ethical', 'personal_statement_probe', 'gap_career_change');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "universities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"country" text DEFAULT 'United Kingdom' NOT NULL,
	"description" text,
	"logo_url" text,
	"interview_overview" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"university_id" uuid NOT NULL,
	"name" text NOT NULL,
	"track" "course_track" DEFAULT 'admission' NOT NULL,
	"interview_format" "interview_format" DEFAULT 'panel' NOT NULL,
	"duration_mins" integer,
	"panel_size" integer,
	"student_context" text,
	"admin_notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_set_id" uuid NOT NULL,
	"text" text NOT NULL,
	"type_tag" "question_type",
	"difficulty" "difficulty" DEFAULT '3' NOT NULL,
	"frequency" "frequency" DEFAULT 'common' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_sets" ADD CONSTRAINT "question_sets_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_question_set_id_question_sets_id_fk" FOREIGN KEY ("question_set_id") REFERENCES "public"."question_sets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "courses_university_idx" ON "courses" ("university_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "question_sets_course_idx" ON "question_sets" ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "questions_set_idx" ON "questions" ("question_set_id");
-- Enable RLS
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Apply RLS Policies
CREATE POLICY universities_policy ON universities
  USING (is_active = true OR current_setting('app.user_role', true) = 'super_admin');

CREATE POLICY courses_policy ON courses
  USING (is_active = true OR current_setting('app.user_role', true) = 'super_admin');

CREATE POLICY question_sets_policy ON question_sets
  USING (is_active = true OR current_setting('app.user_role', true) = 'super_admin');

CREATE POLICY questions_policy ON questions
  USING (is_active = true OR current_setting('app.user_role', true) = 'super_admin');