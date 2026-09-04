import { relations } from "drizzle-orm/relations";
import { users, profiles, universities, courses, question_sets, questions, sessions, feedback_reports, analytics_events, prompts, session_answers, email_tokens, refresh_tokens } from "./schema";

export const profilesRelations = relations(profiles, ({one}) => ({
	user: one(users, {
		fields: [profiles.user_id],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	profiles: many(profiles),
	sessions: many(sessions),
	feedback_reports: many(feedback_reports),
	prompts: many(prompts),
	email_tokens: many(email_tokens),
	refresh_tokens: many(refresh_tokens),
}));

export const coursesRelations = relations(courses, ({one, many}) => ({
	university: one(universities, {
		fields: [courses.university_id],
		references: [universities.id]
	}),
	question_sets: many(question_sets),
	sessions: many(sessions),
}));

export const universitiesRelations = relations(universities, ({many}) => ({
	courses: many(courses),
	sessions: many(sessions),
}));

export const question_setsRelations = relations(question_sets, ({one, many}) => ({
	course: one(courses, {
		fields: [question_sets.course_id],
		references: [courses.id]
	}),
	questions: many(questions),
	sessions: many(sessions),
}));

export const questionsRelations = relations(questions, ({one, many}) => ({
	question_set: one(question_sets, {
		fields: [questions.question_set_id],
		references: [question_sets.id]
	}),
	session_answers: many(session_answers),
}));

export const sessionsRelations = relations(sessions, ({one, many}) => ({
	user: one(users, {
		fields: [sessions.user_id],
		references: [users.id]
	}),
	university: one(universities, {
		fields: [sessions.university_id],
		references: [universities.id]
	}),
	course: one(courses, {
		fields: [sessions.course_id],
		references: [courses.id]
	}),
	question_set: one(question_sets, {
		fields: [sessions.question_set_id],
		references: [question_sets.id]
	}),
	feedback_reports: many(feedback_reports),
	analytics_events: many(analytics_events),
	session_answers: many(session_answers),
}));

export const feedback_reportsRelations = relations(feedback_reports, ({one}) => ({
	session: one(sessions, {
		fields: [feedback_reports.session_id],
		references: [sessions.id]
	}),
	user: one(users, {
		fields: [feedback_reports.reviewed_by],
		references: [users.id]
	}),
}));

export const analytics_eventsRelations = relations(analytics_events, ({one}) => ({
	session: one(sessions, {
		fields: [analytics_events.session_id],
		references: [sessions.id]
	}),
}));

export const promptsRelations = relations(prompts, ({one}) => ({
	user: one(users, {
		fields: [prompts.created_by],
		references: [users.id]
	}),
}));

export const session_answersRelations = relations(session_answers, ({one}) => ({
	session: one(sessions, {
		fields: [session_answers.session_id],
		references: [sessions.id]
	}),
	question: one(questions, {
		fields: [session_answers.question_id],
		references: [questions.id]
	}),
}));

export const email_tokensRelations = relations(email_tokens, ({one}) => ({
	user: one(users, {
		fields: [email_tokens.user_id],
		references: [users.id]
	}),
}));

export const refresh_tokensRelations = relations(refresh_tokens, ({one}) => ({
	user: one(users, {
		fields: [refresh_tokens.user_id],
		references: [users.id]
	}),
}));