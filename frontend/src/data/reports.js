export const reports = [
  {
    id: 1,

    // Report Card Data
    score: 7.2,
    color: "blue",
    title: "University Interview",
    subtitle: "Univ. of Leeds",
    course: "MSc Data Science",
    date: "Today, 4:20 PM",

    // Detail Page Data
    level: "Competent",

    snapshot:
      "Your motivation is clear and genuine — but your answers need specific examples to truly stand out.",


    feedback: [
      {
        type: "good",
        text: "Strong, sincere motivation for your course.",
      },
      {
        type: "improve",
        text: "Answers stay general — add concrete, personal examples.",
      },
      {
        type: "improve",
        text: 'Reduce filler words; pause instead of saying "um".',
      },
    ],


    question: {
      title: "Q1 · Why do you want to study this course?",

      answer: {
        before: "I want to study this because I",
        highlight: "really like the subject",
        after: "and it has a great reputation...",
      },


      structure: 8,
      content: 6,
      language: 7,
      confidence: 8,
    },


    nextSteps: [
      "Rewrite Q1 with one specific story that sparked your interest.",
      'Practise the STAR method for "handling pressure".',
      "Record one answer focusing only on removing filler words.",
    ],
  },


  {
    id: 2,

    // Report Card Data
    score: 6.5,
    color: "green",
    title: "IELTS Speaking",
    subtitle: "",
    course: "Full Test",
    date: "Yesterday, 7:05 PM",


    // Detail Page Data
    level: "Good",

    snapshot:
      "Your fluency is improving, but you need stronger vocabulary and clearer examples to reach a higher band.",


    feedback: [
      {
        type: "good",
        text: "Good speaking flow with confident delivery.",
      },
      {
        type: "improve",
        text: "Use more advanced vocabulary for better scoring.",
      },
      {
        type: "improve",
        text: "Work on pronunciation clarity.",
      },
    ],


    question: {
      title: "Q1 · Describe a memorable experience.",

      answer: {
        before: "One memorable experience was when I",
        highlight: "visited a new place with my family",
        after: "and learned many new things.",
      },


      structure: 7,
      content: 7,
      language: 6,
      confidence: 7,
    },


    nextSteps: [
      "Practice speaking with a wider range of vocabulary.",
      "Record answers and review pronunciation.",
      "Practice Part 2 answers within two minutes.",
    ],
  },


  {
    id: 3,

    // Report Card Data
    score: 6.0,
    color: "orange",
    title: "University Interview",
    subtitle: "Univ. of Manchester",
    course: "",
    date: "2 days ago",


    // Detail Page Data
    level: "Developing",

    snapshot:
      "Your answers show interest, but adding personal experiences will make your responses more convincing.",


    feedback: [
      {
        type: "good",
        text: "Shows clear interest in the chosen field.",
      },
      {
        type: "improve",
        text: "Provide more detailed examples from your experience.",
      },
      {
        type: "improve",
        text: "Improve confidence while answering difficult questions.",
      },
    ],


    question: {
      title: "Q1 · Why did you choose this university?",

      answer: {
        before: "I selected this university because",
        highlight: "it has a strong reputation",
        after: "and offers good opportunities.",
      },


      structure: 6,
      content: 6,
      language: 7,
      confidence: 5,
    },


    nextSteps: [
      "Prepare university-specific reasons.",
      "Practice answering without hesitation.",
      "Add personal stories to your answers.",
    ],
  },
];