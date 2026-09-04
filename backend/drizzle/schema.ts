import { pgTable, foreignKey, pgEnum, uuid, text, varchar, timestamp, real, integer, unique, boolean, index, jsonb } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const course_track = pgEnum("course_track", ['admission', 'visa'])
export const difficulty = pgEnum("difficulty", ['1', '2', '3', '4', '5'])
export const frequency = pgEnum("frequency", ['almost_always', 'common', 'occasional'])
export const interview_format = pgEnum("interview_format", ['mmi', 'panel', 'portfolio', 'one_on_one', 'none'])
export const module = pgEnum("module", ['interview', 'speaking', 'writing', 'listening'])
export const prompt_module = pgEnum("prompt_module", ['interview_feedback', 'ielts_speaking', 'ielts_writing', 'ielts_listening_summary'])
export const question_type = pgEnum("question_type", ['motivational', 'subject_knowledge', 'situational', 'ethical', 'personal_statement_probe', 'gap_career_change'])
export const report_status = pgEnum("report_status", ['ai_reviewed', 'counselor_reviewed'])
export const session_status = pgEnum("session_status", ['in_progress', 'submitted', 'transcribing', 'ai_reviewed', 'counselor_reviewed', 'viewed', 'failed'])
export const user_role = pgEnum("user_role", ['student', 'counselor', 'super_admin'])


export const profiles = pgTable("profiles", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	bio: text("bio"),
	profile_image: varchar("profile_image", { length: 255 }),
	country: varchar("country", { length: 100 }),
	created_at: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	academic_background_text: text("academic_background_text"),
	personal_statement_text: text("personal_statement_text"),
	ielts_target_band: real("ielts_target_band"),
	english_self_rating: integer("english_self_rating"),
	concerns_text: text("concerns_text"),
	target_university_id: uuid("target_university_id"),
	target_course_id: uuid("target_course_id"),
	cv_file_url: text("cv_file_url"),
	transcript_file_url: text("transcript_file_url"),
	sop_file_url: text("sop_file_url"),
});

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	email: varchar("email", { length: 255 }).notNull(),
	password_hash: varchar("password_hash", { length: 255 }),
	full_name: varchar("full_name", { length: 255 }).notNull(),
	role: user_role("role").default('student').notNull(),
	is_suspended: boolean("is_suspended").default(false).notNull(),
	created_at: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updated_at: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	is_email_verified: boolean("is_email_verified").default(false).notNull(),
	google_id: varchar("google_id", { length: 255 }),
},
(table) => {
	return {
		users_email_unique: unique("users_email_unique").on(table.email),
		users_google_id_unique: unique("users_google_id_unique").on(table.google_id),
	}
});

export const universities = pgTable("universities", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	name: text("name").notNull(),
	country: text("country").default('United Kingdom').notNull(),
	description: text("description"),
	logo_url: text("logo_url"),
	interview_overview: text("interview_overview"),
	is_active: boolean("is_active").default(true).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const courses = pgTable("courses", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	university_id: uuid("university_id").notNull().references(() => universities.id, { onDelete: "cascade" } ),
	name: text("name").notNull(),
	track: course_track("track").default('admission').notNull(),
	interview_format: interview_format("interview_format").default('panel').notNull(),
	duration_mins: integer("duration_mins"),
	panel_size: integer("panel_size"),
	student_context: text("student_context"),
	admin_notes: text("admin_notes"),
	is_active: boolean("is_active").default(true).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		university_idx: index("courses_university_idx").on(table.university_id),
	}
});

export const question_sets = pgTable("question_sets", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	course_id: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" } ),
	name: text("name").notNull(),
	description: text("description"),
	is_active: boolean("is_active").default(false).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		course_idx: index("question_sets_course_idx").on(table.course_id),
	}
});

export const questions = pgTable("questions", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	question_set_id: uuid("question_set_id").notNull().references(() => question_sets.id, { onDelete: "cascade" } ),
	text: text("text").notNull(),
	type_tag: question_type("type_tag"),
	difficulty: difficulty("difficulty").default(3).notNull(),
	frequency: frequency("frequency").default('common').notNull(),
	is_active: boolean("is_active").default(true).notNull(),
	version: integer("version").default(1).notNull(),
	order_index: integer("order_index").default(0).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		set_idx: index("questions_set_idx").on(table.question_set_id),
	}
});

export const sessions = pgTable("sessions", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	module: module("module").default('interview').notNull(),
	university_id: uuid("university_id").references(() => universities.id),
	course_id: uuid("course_id").references(() => courses.id),
	question_set_id: uuid("question_set_id").references(() => question_sets.id),
	status: session_status("status").default('in_progress').notNull(),
	started_at: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	submitted_at: timestamp("submitted_at", { withTimezone: true, mode: 'string' }),
	scored_at: timestamp("scored_at", { withTimezone: true, mode: 'string' }),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		user_idx: index("sessions_user_idx").on(table.user_id),
		status_idx: index("sessions_status_idx").on(table.status),
	}
});

export const feedback_reports = pgTable("feedback_reports", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	session_id: uuid("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" } ),
	quick_snapshot_json: jsonb("quick_snapshot_json"),
	deep_report_json: jsonb("deep_report_json"),
	scores_json: jsonb("scores_json"),
	ai_feedback_json: jsonb("ai_feedback_json"),
	counselor_feedback_json: jsonb("counselor_feedback_json"),
	reviewed_by: uuid("reviewed_by").references(() => users.id),
	status: report_status("status").default('ai_reviewed').notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		session_idx: index("feedback_reports_session_idx").on(table.session_id),
		feedback_reports_session_id_unique: unique("feedback_reports_session_id_unique").on(table.session_id),
	}
});

export const analytics_events = pgTable("analytics_events", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	user_id: uuid("user_id"),
	session_id: uuid("session_id").references(() => sessions.id, { onDelete: "cascade" } ),
	event_type: text("event_type").notNull(),
	metadata: jsonb("metadata").default({}),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const prompts = pgTable("prompts", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	version: integer("version").default(1).notNull(),
	is_active: boolean("is_active").default(true).notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	module: prompt_module("module").notNull(),
	content_text: text("content_text").notNull(),
	created_by: uuid("created_by").references(() => users.id),
});

export const session_answers = pgTable("session_answers", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	session_id: uuid("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" } ),
	question_id: uuid("question_id").notNull().references(() => questions.id),
	recording_url: text("recording_url"),
	transcript: text("transcript"),
	duration_seconds: integer("duration_seconds"),
	notes: text("notes"),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	transcription_status: text("transcription_status").default('pending').notNull(),
},
(table) => {
	return {
		session_idx: index("session_answers_session_idx").on(table.session_id),
	}
});

export const email_tokens = pgTable("email_tokens", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	token: varchar("token", { length: 255 }).notNull(),
	type: varchar("type", { length: 50 }).notNull(),
	is_used: boolean("is_used").default(false).notNull(),
	expires_at: timestamp("expires_at", { mode: 'string' }).notNull(),
	created_at: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const refresh_tokens = pgTable("refresh_tokens", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	token: varchar("token", { length: 500 }).notNull(),
	is_revoked: boolean("is_revoked").default(false).notNull(),
	expires_at: timestamp("expires_at", { mode: 'string' }).notNull(),
	created_at: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});