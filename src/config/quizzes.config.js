/**
 * Quiz configurations for each lesson
 * Each quiz contains 5-10 questions testing the lesson content
 */

export const QUIZ_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  FILL_IN_BLANK: 'fill_in_blank',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
  MATCHING: 'matching',
  TRANSLATION: 'translation',
};

/**
 * Quiz data structure for each lesson
 * Questions are language-agnostic templates that will be populated
 * with language-specific content from lessons.config.js
 */
export const LESSON_QUIZZES = {
  1: {
    passingScore: 70,
    questions: [
      {
        id: 'l1q1',
        type: QUIZ_TYPES.LISTENING,
        instruction: 'Listen and identify the sound',
        generateFromLesson: 'phoneticChallenges',
        points: 10,
      },
      {
        id: 'l1q2',
        type: QUIZ_TYPES.MULTIPLE_CHOICE,
        instruction: 'Select the correct special character',
        generateFromLesson: 'specialCharacters',
        points: 10,
      },
      {
        id: 'l1q3',
        type: QUIZ_TYPES.SPEAKING,
        instruction: 'Pronounce this sound correctly',
        generateFromLesson: 'minimalPairs',
        points: 15,
      },
      {
        id: 'l1q4',
        type: QUIZ_TYPES.MATCHING,
        instruction: 'Match the sound to the letter',
        generateFromLesson: 'alphabet',
        points: 10,
      },
      {
        id: 'l1q5',
        type: QUIZ_TYPES.LISTENING,
        instruction: 'Distinguish between minimal pairs',
        generateFromLesson: 'minimalPairs',
        points: 15,
      },
    ],
  },
  2: {
    passingScore: 70,
    questions: [
      {
        id: 'l2q1',
        type: QUIZ_TYPES.LISTENING,
        instruction: 'Identify the stress pattern',
        focus: 'stress_patterns',
        points: 15,
      },
      {
        id: 'l2q2',
        type: QUIZ_TYPES.SPEAKING,
        instruction: 'Repeat with correct intonation',
        focus: 'intonation',
        points: 15,
      },
      {
        id: 'l2q3',
        type: QUIZ_TYPES.MULTIPLE_CHOICE,
        instruction: 'Which syllable is stressed?',
        focus: 'stress_patterns',
        points: 10,
      },
      {
        id: 'l2q4',
        type: QUIZ_TYPES.SPEAKING,
        instruction: 'Shadow this native speaker',
        focus: 'shadowing',
        points: 15,
      },
    ],
  },
  3: {
    passingScore: 70,
    questions: [
      {
        id: 'l3q1',
        type: QUIZ_TYPES.MULTIPLE_CHOICE,
        instruction: 'Choose the appropriate greeting for this situation',
        scenarios: ['formal_morning', 'informal_evening', 'first_meeting'],
        points: 10,
      },
      {
        id: 'l3q2',
        type: QUIZ_TYPES.SPEAKING,
        instruction: 'Greet the person appropriately',
        scenario: 'formal_business',
        points: 15,
      },
      {
        id: 'l3q3',
        type: QUIZ_TYPES.MATCHING,
        instruction: 'Match the greeting to the time of day',
        generateFromLesson: 'greetings',
        points: 10,
      },
      {
        id: 'l3q4',
        type: QUIZ_TYPES.LISTENING,
        instruction: 'Is this formal or informal?',
        focus: 'formality_detection',
        points: 10,
      },
      {
        id: 'l3q5',
        type: QUIZ_TYPES.SPEAKING,
        instruction: 'Respond to "How are you?"',
        points: 15,
      },
    ],
  },
  4: {
    passingScore: 70,
    questions: [
      {
        id: 'l4q1',
        type: QUIZ_TYPES.FILL_IN_BLANK,
        instruction: 'Complete the self-introduction',
        template: 'verb_to_be',
        points: 10,
      },
      {
        id: 'l4q2',
        type: QUIZ_TYPES.SPEAKING,
        instruction: 'Introduce yourself (name, origin, occupation)',
        points: 20,
      },
      {
        id: 'l4q3',
        type: QUIZ_TYPES.TRANSLATION,
        instruction: 'Translate: "I am from..."',
        points: 10,
      },
      {
        id: 'l4q4',
        type: QUIZ_TYPES.MULTIPLE_CHOICE,
        instruction: 'Choose correct verb form',
        focus: 'verb_to_be_conjugation',
        points: 10,
      },
      {
        id: 'l4q5',
        type: QUIZ_TYPES.LISTENING,
        instruction: 'Where is this person from?',
        points: 10,
      },
    ],
  },
  5: {
    passingScore: 70,
    questions: [
      {
        id: 'l5q1',
        type: QUIZ_TYPES.LISTENING,
        instruction: 'Write the number you hear',
        range: '0-100',
        points: 10,
      },
      {
        id: 'l5q2',
        type: QUIZ_TYPES.SPEAKING,
        instruction: 'Say this number',
        generateRandom: 'number_0_100',
        points: 10,
      },
      {
        id: 'l5q3',
        type: QUIZ_TYPES.MULTIPLE_CHOICE,
        instruction: 'What time is it?',
        showClock: true,
        points: 10,
      },
      {
        id: 'l5q4',
        type: QUIZ_TYPES.SPEAKING,
        instruction: 'Tell the time',
        showClock: true,
        points: 15,
      },
      {
        id: 'l5q5',
        type: QUIZ_TYPES.MATCHING,
        instruction: 'Match day/month to translation',
        focus: 'calendar_vocabulary',
        points: 10,
      },
      {
        id: 'l5q6',
        type: QUIZ_TYPES.LISTENING,
        instruction: 'What day of the week is mentioned?',
        points: 10,
      },
    ],
  },
  6: {
    passingScore: 70,
    questions: [
      {
        id: 'l6q1',
        type: QUIZ_TYPES.TRANSLATION,
        instruction: 'Translate the question word',
        focus: 'question_words',
        points: 10,
      },
      {
        id: 'l6q2',
        type: QUIZ_TYPES.FILL_IN_BLANK,
        instruction: 'Complete the question',
        focus: 'question_formation',
        points: 10,
      },
      {
        id: 'l6q3',
        type: QUIZ_TYPES.SPEAKING,
        instruction: 'Ask: "Where is...?"',
        points: 15,
      },
      {
        id: 'l6q4',
        type: QUIZ_TYPES.MULTIPLE_CHOICE,
        instruction: 'Which question word fits?',
        context: 'sentences_missing_question_words',
        points: 10,
      },
      {
        id: 'l6q5',
        type: QUIZ_TYPES.LISTENING,
        instruction: 'What question is being asked?',
        points: 15,
      },
    ],
  },
  7: {
    passingScore: 70,
    questions: [
      {
        id: 'l7q1',
        type: QUIZ_TYPES.MATCHING,
        instruction: 'Match family member to translation',
        generateFromLesson: 'family_vocabulary',
        points: 10,
      },
      {
        id: 'l7q2',
        type: QUIZ_TYPES.FILL_IN_BLANK,
        instruction: 'Complete with possessive',
        focus: 'possessives',
        points: 10,
      },
      {
        id: 'l7q3',
        type: QUIZ_TYPES.SPEAKING,
        instruction: 'Describe your family',
        points: 20,
      },
      {
        id: 'l7q4',
        type: QUIZ_TYPES.LISTENING,
        instruction: 'How many siblings does this person have?',
        points: 10,
      },
      {
        id: 'l7q5',
        type: QUIZ_TYPES.TRANSLATION,
        instruction: 'Translate: "my mother"',
        points: 10,
      },
    ],
  },
  8: {
    passingScore: 70,
    questions: [
      {
        id: 'l8q1',
        type: QUIZ_TYPES.MULTIPLE_CHOICE,
        instruction: 'What color is this?',
        showImage: true,
        points: 10,
      },
      {
        id: 'l8q2',
        type: QUIZ_TYPES.FILL_IN_BLANK,
        instruction: 'Complete with correct adjective',
        focus: 'adjective_agreement',
        points: 10,
      },
      {
        id: 'l8q3',
        type: QUIZ_TYPES.SPEAKING,
        instruction: 'Describe this image',
        showImage: true,
        points: 20,
      },
      {
        id: 'l8q4',
        type: QUIZ_TYPES.MATCHING,
        instruction: 'Match adjective to opposite',
        focus: 'adjectives',
        points: 10,
      },
      {
        id: 'l8q5',
        type: QUIZ_TYPES.TRANSLATION,
        instruction: 'Translate demonstrative phrase',
        examples: ['this book', 'that car'],
        points: 10,
      },
    ],
  },
  9: {
    passingScore: 70,
    questions: [
      {
        id: 'l9q1',
        type: QUIZ_TYPES.MATCHING,
        instruction: 'Match food item to translation',
        focus: 'food_vocabulary',
        points: 10,
      },
      {
        id: 'l9q2',
        type: QUIZ_TYPES.SPEAKING,
        instruction: 'Order this item at a restaurant',
        showImage: 'food_item',
        points: 15,
      },
      {
        id: 'l9q3',
        type: QUIZ_TYPES.MULTIPLE_CHOICE,
        instruction: 'What is the polite way to order?',
        focus: 'restaurant_phrases',
        points: 10,
      },
      {
        id: 'l9q4',
        type: QUIZ_TYPES.LISTENING,
        instruction: 'What did they order?',
        points: 10,
      },
      {
        id: 'l9q5',
        type: QUIZ_TYPES.SPEAKING,
        instruction: 'Ask for the bill',
        points: 15,
      },
    ],
  },
  10: {
    passingScore: 70,
    questions: [
      {
        id: 'l10q1',
        type: QUIZ_TYPES.LISTENING,
        instruction: 'What is the price?',
        points: 15,
      },
      {
        id: 'l10q2',
        type: QUIZ_TYPES.SPEAKING,
        instruction: 'Ask: "How much is this?"',
        points: 15,
      },
      {
        id: 'l10q3',
        type: QUIZ_TYPES.MULTIPLE_CHOICE,
        instruction: 'Which phrase means "too expensive"?',
        points: 10,
      },
      {
        id: 'l10q4',
        type: QUIZ_TYPES.TRANSLATION,
        instruction: 'Translate: "Do you have...?"',
        points: 10,
      },
      {
        id: 'l10q5',
        type: QUIZ_TYPES.SPEAKING,
        instruction: 'Negotiate a lower price',
        roleplay: true,
        points: 20,
      },
    ],
  },
  // Continue pattern for lessons 11-30...
  // For brevity, I'll create a template generator
};

// Generate quizzes for remaining lessons (11-30)
const generateStandardQuiz = (lessonId, lessonTopic, focusAreas) => {
  return {
    passingScore: 70,
    questions: [
      {
        id: `l${lessonId}q1`,
        type: QUIZ_TYPES.MATCHING,
        instruction: `Match ${lessonTopic} vocabulary`,
        focus: focusAreas[0],
        points: 10,
      },
      {
        id: `l${lessonId}q2`,
        type: QUIZ_TYPES.SPEAKING,
        instruction: `Use ${lessonTopic} in a sentence`,
        focus: focusAreas[1],
        points: 15,
      },
      {
        id: `l${lessonId}q3`,
        type: QUIZ_TYPES.LISTENING,
        instruction: `Understand ${lessonTopic} context`,
        focus: focusAreas[2],
        points: 15,
      },
      {
        id: `l${lessonId}q4`,
        type: QUIZ_TYPES.FILL_IN_BLANK,
        instruction: `Complete the ${lessonTopic} phrase`,
        focus: focusAreas[1],
        points: 10,
      },
      {
        id: `l${lessonId}q5`,
        type: QUIZ_TYPES.MULTIPLE_CHOICE,
        instruction: `Choose correct ${lessonTopic} usage`,
        focus: focusAreas[0],
        points: 10,
      },
    ],
  };
};

// Lessons 11-30 quiz generation
LESSON_QUIZZES[11] = generateStandardQuiz(11, 'directions', ['location_vocabulary', 'giving_directions', 'understanding_directions']);
LESSON_QUIZZES[12] = generateStandardQuiz(12, 'weather', ['weather_vocabulary', 'describing_weather', 'small_talk']);
LESSON_QUIZZES[13] = generateStandardQuiz(13, 'present tense', ['verb_conjugation', 'daily_routine', 'frequency']);
LESSON_QUIZZES[14] = generateStandardQuiz(14, 'preferences', ['like_dislike_verbs', 'expressing_preferences', 'giving_reasons']);
LESSON_QUIZZES[15] = generateStandardQuiz(15, 'future plans', ['future_constructions', 'making_invitations', 'accepting_declining']);
LESSON_QUIZZES[16] = generateStandardQuiz(16, 'past tense', ['past_conjugation', 'time_expressions', 'narrating_events']);
LESSON_QUIZZES[17] = generateStandardQuiz(17, 'phone communication', ['phone_vocabulary', 'making_calls', 'leaving_messages']);
LESSON_QUIZZES[18] = generateStandardQuiz(18, 'emergencies', ['emergency_vocabulary', 'asking_for_help', 'describing_problems']);
LESSON_QUIZZES[19] = generateStandardQuiz(19, 'emotions', ['emotion_vocabulary', 'expressing_feelings', 'showing_empathy']);
LESSON_QUIZZES[20] = generateStandardQuiz(20, 'work and studies', ['profession_vocabulary', 'describing_work', 'skills_abilities']);
LESSON_QUIZZES[21] = generateStandardQuiz(21, 'clarification', ['asking_repetition', 'requesting_explanation', 'indicating_confusion']);
LESSON_QUIZZES[22] = generateStandardQuiz(22, 'opinions', ['opinion_expressions', 'agreeing_disagreeing', 'debating']);
LESSON_QUIZZES[23] = generateStandardQuiz(23, 'comparisons', ['comparative_forms', 'superlative_forms', 'making_comparisons']);
LESSON_QUIZZES[24] = generateStandardQuiz(24, 'connectors', ['conjunctions', 'discourse_markers', 'narrative_flow']);
LESSON_QUIZZES[25] = generateStandardQuiz(25, 'culture', ['cultural_awareness', 'idioms', 'formality_levels']);
LESSON_QUIZZES[26] = generateStandardQuiz(26, 'travel', ['travel_vocabulary', 'hotel_phrases', 'tourist_situations']);
LESSON_QUIZZES[27] = generateStandardQuiz(27, 'social events', ['social_vocabulary', 'compliments', 'celebrations']);
LESSON_QUIZZES[28] = generateStandardQuiz(28, 'problem solving', ['problem_vocabulary', 'explaining_issues', 'negotiating_solutions']);
LESSON_QUIZZES[29] = generateStandardQuiz(29, 'storytelling', ['narrative_tenses', 'story_structure', 'humor']);
LESSON_QUIZZES[30] = {
  passingScore: 80,
  questions: [
    {
      id: 'l30q1',
      type: QUIZ_TYPES.SPEAKING,
      instruction: '5-minute free conversation on any topic',
      duration: 300,
      points: 30,
    },
    {
      id: 'l30q2',
      type: QUIZ_TYPES.LISTENING,
      instruction: 'Understand extended conversation',
      duration: 180,
      points: 20,
    },
    {
      id: 'l30q3',
      type: QUIZ_TYPES.SPEAKING,
      instruction: 'Tell a 2-minute story',
      duration: 120,
      points: 30,
    },
    {
      id: 'l30q4',
      type: QUIZ_TYPES.MULTIPLE_CHOICE,
      instruction: 'Comprehensive grammar review',
      questionCount: 10,
      points: 20,
    },
  ],
};

/**
 * Get quiz for a specific lesson
 */
export const getQuizForLesson = (lessonId) => {
  return LESSON_QUIZZES[lessonId] || null;
};

/**
 * Calculate quiz score
 */
export const calculateQuizScore = (answers, correctAnswers) => {
  let totalPoints = 0;
  let earnedPoints = 0;

  Object.keys(correctAnswers).forEach(questionId => {
    const question = Object.values(LESSON_QUIZZES)
      .flatMap(quiz => quiz.questions)
      .find(q => q.id === questionId);

    if (question) {
      totalPoints += question.points;
      if (answers[questionId] === correctAnswers[questionId]) {
        earnedPoints += question.points;
      }
    }
  });

  return {
    score: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0,
    earnedPoints,
    totalPoints,
  };
};

/**
 * Check if user passed quiz
 */
export const didPassQuiz = (lessonId, score) => {
  const quiz = LESSON_QUIZZES[lessonId];
  return quiz && score >= quiz.passingScore;
};

export default LESSON_QUIZZES;
