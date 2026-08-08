ALTER TABLE "profiles" ADD COLUMN "academic_background_text" text;
ALTER TABLE "profiles" ADD COLUMN "personal_statement_text" text;
ALTER TABLE "profiles" ADD COLUMN "ielts_target_band" real;
ALTER TABLE "profiles" ADD COLUMN "english_self_rating" integer;
ALTER TABLE "profiles" ADD COLUMN "concerns_text" text;
ALTER TABLE "profiles" ADD COLUMN "target_university_id" uuid;
ALTER TABLE "profiles" ADD COLUMN "target_course_id" uuid;
