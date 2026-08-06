import { pgEnum } from 'drizzle-orm/pg-core';

export const courseTrackEnum = pgEnum('course_track', ['admission', 'visa']);

export const interviewFormatEnum = pgEnum('interview_format', [
    'mmi',
    'panel',
    'portfolio',
    'one_on_one',
    'none',
]);

export const questionTypeEnum = pgEnum('question_type', [
    'motivational',
    'subject_knowledge',
    'situational',
    'ethical',
    'personal_statement_probe',
    'gap_career_change',
]);

export const difficultyEnum = pgEnum('difficulty', ['1', '2', '3', '4', '5']);

export const frequencyEnum = pgEnum('frequency', [
    'almost_always',
    'common',
    'occasional',
]);

export const moduleEnum = pgEnum('module', [
    'interview',
    'speaking',
    'writing',
    'listening',
]);

export const sessionStatusEnum = pgEnum('session_status', [
    'in_progress',
    'submitted',
    'transcribing',
    'ai_reviewed',
    'counselor_reviewed',
    'viewed',
    'failed',
]);

export const reportStatusEnum = pgEnum('report_status', [
    'ai_reviewed',
    'counselor_reviewed',
]);