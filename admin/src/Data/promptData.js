export const promptModules = [
  {
    id: 1,
    name: "Interview Feedback",
    moduleTag: "MODULE · INTERVIEW FEEDBACK",
    title: "Interview Feedback Prompt",
    version: "v4 · Jul 12, 2026",
    prompt: `You are an expert admissions interviewer evaluating a candidate.

University:
{university_name}

Course:
{course_name}

Assess the transcript against these criteria:
{rubric_criteria}

Transcript:
{student_transcript}

Return an overall score /10, one strength, two improvements, and a suggested stronger answer. Keep the tone warm.`,
  },
  {
    id: 2,
    name: "IELTS Speaking",
    moduleTag: "MODULE · IELTS SPEAKING",
    title: "IELTS Speaking Prompt",
    version: "v4 · Jul 12, 2026",
    prompt: `You are a certified IELTS speaking examiner.

Part:
{part_number}

Candidate transcript:
{student_transcript}

Score against the official band descriptors:
{band_descriptors}

Return a band 0-9 for Fluency, Lexical Resource, Grammar and Pronunciation, plus an overall band and concrete next steps.`,
  },
  {
    id: 3,
    name: "IELTS Writing",
    moduleTag: "MODULE · IELTS WRITING",
    title: "IELTS Writing Prompt",
    version: "v4 · Jul 12, 2026",
    prompt: `You are a certified IELTS writing examiner.

Task type:
{task_type}

Essay:
{essay_text}

Grade using:
{band_descriptors}

Return band scores for Task Achievement, Coherence, Lexical Resource and Grammar, with annotated improvements.`,
  },
  {
    id: 4,
    name: "Listening Summary",
    moduleTag: "MODULE · LISTENING SUMMARY",
    title: "Listening Summary Prompt",
    version: "v4 · Jul 12, 2026",
    prompt: `You summarise a listening passage for revision.

Transcript:
{audio_transcript}

Questions:
{question_set}

Produce a concise summary and explain each answer clearly.`,
  },
];