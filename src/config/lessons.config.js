/**
 * Comprehensive Lesson Curriculum for Language Learning
 * 30 lessons structured to achieve basic conversational fluency
 * with language-specific adaptations
 */

// Language-specific adaptations
const LANGUAGE_ADAPTATIONS = {
  spanish: {
    hasGenderNouns: true,
    hasFormalInformal: true,
    phoneticChallenges: ['rr', 'j', 'ñ'],
    verbConjugationComplexity: 'high',
    accentMarks: true,
    specialCharacters: ['ñ', 'á', 'é', 'í', 'ó', 'ú', '¿', '¡'],
  },
  french: {
    hasGenderNouns: true,
    hasFormalInformal: true,
    phoneticChallenges: ['r', 'u', 'eu', 'nasal vowels'],
    verbConjugationComplexity: 'high',
    accentMarks: true,
    specialCharacters: ['é', 'è', 'ê', 'à', 'ù', 'ç', 'ô'],
    liaisonRules: true,
  },
  german: {
    hasGenderNouns: true,
    hasFormalInformal: true,
    phoneticChallenges: ['ch', 'ü', 'ö', 'ä'],
    verbConjugationComplexity: 'medium',
    hasCases: true,
    specialCharacters: ['ä', 'ö', 'ü', 'ß'],
    compoundWords: true,
  },
  italian: {
    hasGenderNouns: true,
    hasFormalInformal: true,
    phoneticChallenges: ['gl', 'gn', 'doubled consonants'],
    verbConjugationComplexity: 'high',
    accentMarks: true,
    specialCharacters: ['à', 'è', 'é', 'ì', 'ò', 'ù'],
  },
  japanese: {
    hasGenderNouns: false,
    hasFormalInformal: true,
    phoneticChallenges: ['r/l distinction', 'long vowels'],
    verbConjugationComplexity: 'medium',
    writingSystems: ['hiragana', 'katakana', 'kanji'],
    honorifics: true,
    particles: true,
  },
  mandarin: {
    hasGenderNouns: false,
    hasFormalInformal: true,
    phoneticChallenges: ['tones', 'zh/ch/sh', 'x/q'],
    verbConjugationComplexity: 'low',
    tones: 4,
    writingSystem: 'characters',
    measureWords: true,
  },
  korean: {
    hasGenderNouns: false,
    hasFormalInformal: true,
    phoneticChallenges: ['aspirated consonants', 'final consonants'],
    verbConjugationComplexity: 'medium',
    honorifics: true,
    writingSystem: 'hangul',
    particleSystem: true,
  },
  arabic: {
    hasGenderNouns: true,
    hasFormalInformal: true,
    phoneticChallenges: ['pharyngeal consonants', 'emphatic consonants'],
    verbConjugationComplexity: 'high',
    writingSystem: 'arabic script',
    rightToLeft: true,
    rootSystem: true,
  },
  russian: {
    hasGenderNouns: true,
    hasFormalInformal: true,
    phoneticChallenges: ['ы', 'soft/hard consonants', 'р'],
    verbConjugationComplexity: 'high',
    hasCases: true,
    writingSystem: 'cyrillic',
    aspectualPairs: true,
  },
  portuguese: {
    hasGenderNouns: true,
    hasFormalInformal: true,
    phoneticChallenges: ['nasal vowels', 'lh', 'nh'],
    verbConjugationComplexity: 'high',
    accentMarks: true,
    specialCharacters: ['á', 'â', 'ã', 'à', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ç'],
  },
};

// Base lesson structure
const LESSONS = [
  // PHASE 1: Foundation (Lessons 1-8)
  {
    id: 1,
    phase: 1,
    title: 'Sound System & Alphabet',
    description: 'Master the target language alphabet and key phonemes',
    objectives: [
      'Recognize and produce all sounds in the target language',
      'Identify sounds that don\'t exist in native language',
      'Practice mouth positioning for difficult sounds',
    ],
    topics: ['alphabet', 'phonemes', 'pronunciation'],
    estimatedMinutes: 30,
    exercises: [
      { type: 'listening', focus: 'minimal_pairs' },
      { type: 'speaking', focus: 'sound_production' },
      { type: 'recognition', focus: 'alphabet' },
    ],
    languageSpecific: {
      spanish: {
        focus: ['vowels (pure sounds)', 'rr vs r', 'j sound', 'ñ'],
        minimalPairs: [['pero', 'perro'], ['casa', 'caza']],
      },
      french: {
        focus: ['nasal vowels', 'r sound', 'u vs ou', 'silent letters'],
        minimalPairs: [['tu', 'tout'], ['bon', 'beau']],
      },
      german: {
        focus: ['ä, ö, ü', 'ch sounds', 'r sound', 'ß'],
        minimalPairs: [['Mutter', 'Mütter'], ['Bach', 'Buch']],
      },
      japanese: {
        focus: ['hiragana sounds', 'long vowels', 'r sound', 'tsu'],
        introduceTsu: true,
        introduceDoubleConsonants: true,
      },
      mandarin: {
        focus: ['4 tones', 'zh/ch/sh', 'j/q/x', 'pinyin system'],
        toneExercises: true,
        tonePairs: true,
      },
      korean: {
        focus: ['hangul consonants', 'hangul vowels', 'aspirated sounds', 'double consonants'],
        hangulChart: true,
      },
      arabic: {
        focus: ['arabic letters', 'emphatic consonants', 'ayn and ghayn', 'short/long vowels'],
        letterForms: ['isolated', 'initial', 'medial', 'final'],
      },
    },
    unlocks: 'Can recognize and produce basic sounds',
  },
  {
    id: 2,
    phase: 1,
    title: 'Pronunciation Patterns',
    description: 'Learn stress, intonation, and rhythm of natural speech',
    objectives: [
      'Apply correct stress patterns to words and sentences',
      'Use appropriate intonation for statements and questions',
      'Mimic natural speech rhythm',
    ],
    topics: ['stress', 'intonation', 'rhythm', 'shadowing'],
    estimatedMinutes: 30,
    exercises: [
      { type: 'listening', focus: 'stress_patterns' },
      { type: 'shadowing', focus: 'native_speakers' },
      { type: 'speaking', focus: 'intonation' },
    ],
    languageSpecific: {
      spanish: {
        focus: ['syllable stress', 'accent marks indicate stress', 'questions have rising intonation'],
        stressRules: 'last syllable or marked vowel',
      },
      french: {
        focus: ['final syllable stress', 'liaison', 'enchaînement', 'rising/falling intonation'],
        liaisonExamples: true,
      },
      german: {
        focus: ['first syllable stress', 'compound word stress', 'sentence melody'],
        compoundStress: 'first element',
      },
      japanese: {
        focus: ['pitch accent', 'flat intonation', 'particle stress'],
        pitchPatterns: ['平板', '頭高', '中高', '尾高'],
      },
      mandarin: {
        focus: ['tone sandhi', 'neutral tone', 'emphasis through tone'],
        toneSandhiRules: true,
      },
      korean: {
        focus: ['relatively flat intonation', 'sentence-final intonation', 'question intonation'],
      },
      arabic: {
        focus: ['stress on last heavy syllable', 'emphatic consonant spread', 'question intonation'],
      },
    },
    unlocks: 'Can mimic natural speech rhythm',
  },
  {
    id: 3,
    phase: 1,
    title: 'Essential Greetings',
    description: 'Master basic greetings and farewells',
    objectives: [
      'Greet people appropriately in formal and informal settings',
      'Ask and answer "How are you?"',
      'Say goodbye appropriately',
    ],
    topics: ['greetings', 'farewells', 'politeness', 'formality'],
    estimatedMinutes: 25,
    vocabulary: ['hello', 'goodbye', 'good morning', 'good evening', 'how are you', 'fine', 'thank you'],
    exercises: [
      { type: 'roleplay', scenario: 'meeting_someone' },
      { type: 'conversation', focus: 'greetings' },
      { type: 'listening', focus: 'formality_levels' },
    ],
    languageSpecific: {
      spanish: {
        phrases: {
          informal: ['Hola', '¿Qué tal?', 'Adiós', 'Hasta luego'],
          formal: ['Buenos días', 'Buenas tardes', 'Buenas noches', '¿Cómo está usted?'],
        },
        tuVsUsted: true,
      },
      french: {
        phrases: {
          informal: ['Salut', 'Ça va?', 'Ciao'],
          formal: ['Bonjour', 'Bonsoir', 'Au revoir', 'Comment allez-vous?'],
        },
        tuVsVous: true,
        bisosCulture: true,
      },
      german: {
        phrases: {
          informal: ['Hallo', 'Wie geht\'s?', 'Tschüss'],
          formal: ['Guten Tag', 'Guten Abend', 'Auf Wiedersehen', 'Wie geht es Ihnen?'],
        },
        duVsSie: true,
      },
      japanese: {
        phrases: {
          casual: ['おはよう', 'じゃあね', 'バイバイ'],
          formal: ['おはようございます', 'こんにちは', 'こんばんは', 'さようなら'],
        },
        bowing: true,
        honorificLevels: true,
      },
      mandarin: {
        phrases: {
          general: ['你好 (nǐ hǎo)', '再见 (zàijiàn)', '早上好 (zǎoshang hǎo)'],
          formal: ['您好 (nín hǎo)'],
        },
        nǐVsNín: true,
      },
      korean: {
        phrases: {
          informal: ['안녕', '잘 가'],
          formal: ['안녕하세요', '안녕하십니까', '안녕히 가세요', '안녕히 계세요'],
        },
        honorificSystem: true,
        goingVsStaying: true,
      },
      arabic: {
        phrases: {
          general: ['السلام عليكم', 'وعليكم السلام', 'مرحبا', 'مع السلامة'],
          timeSpecific: ['صباح الخير', 'مساء الخير'],
        },
        responseFormulas: true,
      },
    },
    aiRoleplay: {
      scenario: 'casual_meeting',
      prompts: ['Greet the user', 'Ask how they are', 'Make small talk', 'Say goodbye'],
    },
    unlocks: 'Can greet people in various contexts',
  },
  {
    id: 4,
    phase: 1,
    title: 'Self-Introduction',
    description: 'Introduce yourself and share basic personal information',
    objectives: [
      'State your name',
      'Say where you\'re from',
      'Mention your occupation or studies',
      'Talk about your age (if culturally appropriate)',
    ],
    topics: ['personal_info', 'countries', 'occupations', 'verb_to_be'],
    estimatedMinutes: 30,
    vocabulary: ['name', 'from', 'country', 'city', 'job', 'student', 'teacher', 'doctor', 'engineer'],
    grammar: ['verb_to_be', 'possessive_my'],
    exercises: [
      { type: 'fill_in_blank', focus: 'verb_to_be' },
      { type: 'speaking', focus: 'self_introduction' },
      { type: 'conversation', focus: 'asking_about_others' },
    ],
    languageSpecific: {
      spanish: {
        grammar: {
          verbs: ['ser (to be - permanent)', 'llamarse (to be called)'],
          examples: ['Me llamo...', 'Soy de...', 'Soy estudiante'],
        },
        genderAgreement: true,
      },
      french: {
        grammar: {
          verbs: ['être (to be)', 's\'appeler (to call oneself)'],
          examples: ['Je m\'appelle...', 'Je suis de...', 'Je suis étudiant(e)'],
        },
        genderAgreement: true,
      },
      german: {
        grammar: {
          verbs: ['sein (to be)', 'heißen (to be called)', 'kommen aus (to come from)'],
          examples: ['Ich heiße...', 'Ich komme aus...', 'Ich bin Student'],
        },
        nounCapitalization: true,
      },
      japanese: {
        grammar: {
          particles: ['は (wa) - topic marker', 'です (desu) - polite copula'],
          examples: ['私は...です', '...から来ました'],
        },
        nameOrder: 'family name first in formal contexts',
      },
      mandarin: {
        grammar: {
          structure: ['我是... (wǒ shì...)', '我叫... (wǒ jiào...)', '我来自... (wǒ láizì...)'],
        },
        noVerbConjugation: true,
      },
      korean: {
        grammar: {
          particles: ['는/은 (topic)', '이에요/예요 (polite copula)'],
          examples: ['저는...입니다', '...에서 왔어요'],
        },
        humbleVerbs: true,
      },
      arabic: {
        grammar: {
          verbs: ['أنا (I am - no verb needed for present)', 'اسمي (my name)'],
          examples: ['اسمي...', 'أنا من...'],
        },
        genderAgreement: true,
      },
    },
    aiRoleplay: {
      scenario: 'first_meeting',
      prompts: ['Ask user their name', 'Ask where they\'re from', 'Ask about their job/studies'],
    },
    unlocks: 'Can introduce yourself confidently',
  },
  {
    id: 5,
    phase: 1,
    title: 'Numbers & Time',
    description: 'Learn numbers and how to tell time',
    objectives: [
      'Count from 0 to 100',
      'Tell the time',
      'Say days of the week and months',
      'Use numbers in context',
    ],
    topics: ['numbers', 'time', 'calendar', 'days', 'months'],
    estimatedMinutes: 35,
    vocabulary: ['numbers_0_100', 'days_of_week', 'months', 'hour', 'minute', 'today', 'tomorrow', 'yesterday'],
    exercises: [
      { type: 'listening', focus: 'number_recognition' },
      { type: 'speaking', focus: 'telling_time' },
      { type: 'quiz', focus: 'number_dictation' },
    ],
    languageSpecific: {
      spanish: {
        numberSystem: 'base-10, gender agreement with uno/una',
        timeFormat: '24-hour common, "son las" for plural hours',
        specialNotes: 'numbers 16-19 can be written as one word or three',
      },
      french: {
        numberSystem: 'base-20 for 60-99 (soixante-dix = 60+10)',
        timeFormat: '24-hour official, 12-hour casual with "et demie", "et quart"',
        specialNotes: 'quatre-vingts (4×20), quatre-vingt-dix (4×20+10)',
      },
      german: {
        numberSystem: 'ones before tens (einundzwanzig = one-and-twenty)',
        timeFormat: 'vor/nach system for minutes, "Viertel", "halb"',
        specialNotes: 'halb means half BEFORE the hour (halb zehn = 9:30)',
      },
      japanese: {
        numberSystem: 'two systems: sino-japanese (一、二、三) and native (ひとつ、ふたつ、みっつ)',
        timeFormat: '時 (ji) for hour, 分 (fun/pun) for minute',
        counters: true,
        specialNotes: 'counter words change pronunciation (4時 = よじ)',
      },
      mandarin: {
        numberSystem: 'two for 2 (二 èr, 两 liǎng)',
        timeFormat: '点 (diǎn) for hour, 分 (fēn) for minute',
        specialNotes: 'measure words needed (两个月 = two months)',
      },
      korean: {
        numberSystem: 'two systems: sino-korean (일, 이, 삼) and native (하나, 둘, 셋)',
        timeFormat: 'native numbers for hours, sino-korean for minutes',
        specialNotes: 'hours use native, minutes use sino-korean',
      },
      arabic: {
        numberSystem: 'different numerals (٠ ١ ٢ ٣), gender agreement',
        timeFormat: 'الساعة (the hour)',
        specialNotes: 'numbers 3-10 have reverse gender agreement',
      },
    },
    aiRoleplay: {
      scenario: 'scheduling',
      prompts: ['Ask what time user wakes up', 'Discuss daily schedule', 'Make appointment'],
    },
    unlocks: 'Can discuss time and schedule',
  },
  {
    id: 6,
    phase: 1,
    title: 'Basic Questions',
    description: 'Ask and answer fundamental questions',
    objectives: [
      'Use question words (what, where, when, who, why, how)',
      'Form yes/no questions',
      'Apply correct question intonation',
      'Use polite question forms',
    ],
    topics: ['question_words', 'interrogatives', 'intonation', 'politeness'],
    estimatedMinutes: 30,
    vocabulary: ['what', 'where', 'when', 'who', 'why', 'how', 'which'],
    grammar: ['question_formation', 'word_order', 'politeness_markers'],
    exercises: [
      { type: 'transformation', focus: 'statement_to_question' },
      { type: 'conversation', focus: 'asking_questions' },
      { type: 'game', focus: '20_questions' },
    ],
    languageSpecific: {
      spanish: {
        questionWords: ['qué', 'dónde', 'cuándo', 'quién', 'por qué', 'cómo', 'cuál'],
        wordOrder: 'inverted subject-verb or same as statement with intonation',
        specialMarks: '¿question?',
      },
      french: {
        questionWords: ['qu\'est-ce que', 'où', 'quand', 'qui', 'pourquoi', 'comment'],
        formation: ['est-ce que', 'inversion', 'intonation'],
        specialNotes: 'three ways to ask: intonation, est-ce que, inversion',
      },
      german: {
        questionWords: ['was', 'wo', 'wann', 'wer', 'warum', 'wie', 'welcher'],
        wordOrder: 'verb-second position (V2)',
        specialNotes: 'verb must be in second position',
      },
      japanese: {
        questionWords: ['何 (nani/nan)', 'どこ', 'いつ', '誰', 'なぜ', 'どう'],
        particle: 'か (ka) at end for questions',
        specialNotes: 'word order same as statements, add か',
      },
      mandarin: {
        questionWords: ['什么 (shénme)', '哪里 (nǎlǐ)', '什么时候', '谁 (shéi)', '为什么', '怎么'],
        particle: '吗 (ma) for yes/no questions',
        specialNotes: 'question word replaces answer in sentence',
      },
      korean: {
        questionWords: ['무엇', '어디', '언제', '누구', '왜', '어떻게'],
        endings: ['요 for polite questions', '니까 for formal'],
        specialNotes: 'rising intonation at end',
      },
      arabic: {
        questionWords: ['ما/ماذا', 'أين', 'متى', 'من', 'لماذا', 'كيف'],
        particle: 'هل for yes/no questions',
        specialNotes: 'question word at beginning usually',
      },
    },
    aiRoleplay: {
      scenario: '20_questions_game',
      prompts: ['Answer user questions', 'Ask user questions', 'Give hints'],
    },
    unlocks: 'Can ask for information confidently',
  },
  {
    id: 7,
    phase: 1,
    title: 'Family & Relationships',
    description: 'Talk about family members and relationships',
    objectives: [
      'Name family members',
      'Use possessive forms',
      'Describe family size',
      'Introduce others',
    ],
    topics: ['family', 'possessives', 'relationships', 'introductions'],
    estimatedMinutes: 30,
    vocabulary: ['mother', 'father', 'sister', 'brother', 'child', 'parent', 'grandmother', 'grandfather', 'aunt', 'uncle', 'cousin'],
    grammar: ['possessives', 'plural_forms', 'have_verb'],
    exercises: [
      { type: 'vocabulary', focus: 'family_tree' },
      { type: 'speaking', focus: 'describe_family' },
      { type: 'listening', focus: 'family_descriptions' },
    ],
    languageSpecific: {
      spanish: {
        vocabulary: ['madre', 'padre', 'hermana', 'hermano', 'hijo/hija', 'abuelo/abuela'],
        possessives: ['mi', 'tu', 'su', 'nuestro', 'vuestro'],
        verb: 'tener (to have)',
        specialNotes: 'gender agreement, masculine plural for mixed groups',
      },
      french: {
        vocabulary: ['mère', 'père', 'sœur', 'frère', 'fils/fille', 'grand-père/grand-mère'],
        possessives: ['mon/ma', 'ton/ta', 'son/sa', 'notre', 'votre', 'leur'],
        verb: 'avoir (to have)',
        specialNotes: 'possessive agrees with possessed item, not possessor',
      },
      german: {
        vocabulary: ['Mutter', 'Vater', 'Schwester', 'Bruder', 'Kind', 'Großeltern'],
        possessives: ['mein', 'dein', 'sein/ihr', 'unser', 'euer'],
        verb: 'haben (to have)',
        specialNotes: 'possessives decline like ein, family nouns capitalized',
      },
      japanese: {
        vocabulary: {
          own: ['母', '父', '姉/兄', '妹/弟'],
          others: ['お母さん', 'お父さん', 'お姉さん/お兄さん', '妹さん/弟さん'],
        },
        possessives: 'の particle',
        specialNotes: 'different words for own family vs others\' family',
      },
      mandarin: {
        vocabulary: ['妈妈 (māma)', '爸爸 (bàba)', '姐姐/哥哥', '妹妹/弟弟'],
        possessiveParticle: '的 (de)',
        verb: '有 (yǒu) to have',
        specialNotes: 'different terms for older vs younger siblings',
      },
      korean: {
        vocabulary: ['어머니/엄마', '아버지/아빠', '언니/누나/오빠/형', '동생'],
        possessiveParticle: '의 (ui) or direct attachment',
        specialNotes: 'different words based on speaker\'s gender and relative age',
      },
      arabic: {
        vocabulary: ['أم', 'أب', 'أخت', 'أخ', 'ابن/بنت', 'جد/جدة'],
        possessives: 'suffix pronouns (-ي, -ك, -ه)',
        verb: 'عند (to have - literally "at/with")',
        specialNotes: 'possessive suffixes attach to nouns',
      },
    },
    aiRoleplay: {
      scenario: 'family_discussion',
      prompts: ['Ask about user\'s family', 'Describe AI\'s "family"', 'Compare families'],
    },
    unlocks: 'Can describe family and relationships',
  },
  {
    id: 8,
    phase: 1,
    title: 'Colors, Adjectives & Descriptions',
    description: 'Describe objects and people using adjectives',
    objectives: [
      'Name common colors',
      'Use size and shape adjectives',
      'Describe personality traits',
      'Use demonstratives (this/that)',
    ],
    topics: ['colors', 'adjectives', 'descriptions', 'demonstratives'],
    estimatedMinutes: 30,
    vocabulary: ['colors', 'big', 'small', 'tall', 'short', 'beautiful', 'ugly', 'nice', 'bad', 'this', 'that'],
    grammar: ['adjective_placement', 'adjective_agreement', 'demonstratives'],
    exercises: [
      { type: 'game', focus: 'describe_and_guess' },
      { type: 'speaking', focus: 'photo_description' },
      { type: 'writing', focus: 'person_description' },
    ],
    languageSpecific: {
      spanish: {
        colors: ['rojo/a', 'azul', 'verde', 'amarillo/a', 'negro/a', 'blanco/a'],
        adjectivePlacement: 'usually after noun',
        agreement: 'gender and number',
        demonstratives: ['este/a/os/as', 'ese/a/os/as', 'aquel/aquella'],
      },
      french: {
        colors: ['rouge', 'bleu(e)', 'vert(e)', 'jaune', 'noir(e)', 'blanc(he)'],
        adjectivePlacement: 'mostly after, some before (BANGS)',
        agreement: 'gender and number',
        demonstratives: ['ce/cet', 'cette', 'ces'],
      },
      german: {
        colors: ['rot', 'blau', 'grün', 'gelb', 'schwarz', 'weiß'],
        adjectivePlacement: 'before noun',
        agreement: 'case, gender, number (weak/strong/mixed)',
        demonstratives: ['dieser/diese/dieses', 'jener'],
      },
      japanese: {
        colors: {
          iAdjectives: ['赤い (akai)', '青い', '黄色い', '白い', '黒い'],
          noAdjectives: ['緑 (midori)', '茶色 (chairo)'],
        },
        adjectivePlacement: 'before noun',
        types: 'i-adjectives vs na-adjectives',
        demonstratives: ['この', 'その', 'あの', 'どの'],
      },
      mandarin: {
        colors: ['红 (hóng)', '蓝', '绿', '黄', '黑', '白'],
        adjectivePlacement: 'before noun with 的',
        noAgreement: true,
        demonstratives: ['这 (zhè)', '那 (nà)'],
      },
      korean: {
        colors: ['빨강', '파랑', '초록', '노랑', '검정', '하양'],
        adjectivePlacement: 'before noun',
        descriptiveVerbs: 'adjectives conjugate like verbs',
        demonstratives: ['이', '그', '저'],
      },
      arabic: {
        colors: ['أحمر/حمراء', 'أزرق/زرقاء', 'أخضر/خضراء', 'أصفر/صفراء'],
        adjectivePlacement: 'after noun',
        agreement: 'gender, number, definiteness',
        demonstratives: ['هذا/هذه', 'ذلك/تلك'],
      },
    },
    aiRoleplay: {
      scenario: 'describe_photos',
      prompts: ['Show photos and ask for descriptions', 'Describe objects for user to guess', 'Compare items'],
    },
    unlocks: 'Can describe objects and people',
  },

  // PHASE 2: Daily Life (Lessons 9-16)
  {
    id: 9,
    phase: 2,
    title: 'Food & Ordering',
    description: 'Order food and discuss dietary preferences',
    objectives: [
      'Name common foods and drinks',
      'Order at a restaurant',
      'Express food preferences',
      'Mention dietary restrictions',
    ],
    topics: ['food', 'drinks', 'restaurant', 'ordering', 'preferences'],
    estimatedMinutes: 35,
    vocabulary: ['food_items', 'drinks', 'menu', 'bill', 'waiter', 'delicious', 'hungry', 'thirsty'],
    grammar: ['want_verb', 'would_like', 'polite_requests'],
    exercises: [
      { type: 'roleplay', scenario: 'restaurant_ordering' },
      { type: 'listening', focus: 'menu_descriptions' },
      { type: 'speaking', focus: 'food_preferences' },
    ],
    languageSpecific: {
      spanish: {
        phrases: ['Quisiera...', 'Me gustaría...', 'La cuenta, por favor'],
        verb: 'querer (to want)',
        culturalNotes: 'tipping customs, meal times later than US',
      },
      french: {
        phrases: ['Je voudrais...', 'L\'addition, s\'il vous plaît', 'C\'est délicieux'],
        verb: 'vouloir (to want)',
        culturalNotes: 'bread always included, splitting bill less common',
      },
      german: {
        phrases: ['Ich hätte gern...', 'Ich möchte...', 'Die Rechnung, bitte'],
        verb: 'möchten (would like)',
        culturalNotes: 'pay at table, tap water not free',
      },
      japanese: {
        phrases: ['...をください', 'お願いします', 'ごちそうさまでした'],
        culturalNotes: 'no tipping, call staff with すみません, slurping ok',
        honorifics: 'food terms with お prefix',
      },
      mandarin: {
        phrases: ['我要... (wǒ yào)', '请给我...', '买单'],
        measureWords: '一杯咖啡, 一碗饭',
        culturalNotes: 'tea refilled automatically, family style sharing',
      },
      korean: {
        phrases: ['...주세요', '계산해 주세요', '맛있어요'],
        culturalNotes: 'side dishes (반찬) free and unlimited, youngest pays',
        honorifics: true,
      },
      arabic: {
        phrases: ['أريد...', 'من فضلك', 'الحساب لو سمحت'],
        culturalNotes: 'right hand for eating, bread as utensil, generous portions',
      },
    },
    aiRoleplay: {
      scenario: 'restaurant',
      prompts: ['Greet as waiter', 'Take order', 'Suggest dishes', 'Bring bill'],
    },
    unlocks: 'Can order food confidently',
  },
  {
    id: 10,
    phase: 2,
    title: 'Shopping Basics',
    description: 'Navigate shopping situations and discuss prices',
    objectives: [
      'Ask for prices',
      'Negotiate or express price opinions',
      'Discuss payment methods',
      'Request items in stores',
    ],
    topics: ['shopping', 'prices', 'payment', 'stores', 'clothing'],
    estimatedMinutes: 30,
    vocabulary: ['store_types', 'clothing', 'money', 'price', 'cheap', 'expensive', 'credit_card', 'cash'],
    grammar: ['how_much', 'this_that_plural', 'large_numbers'],
    exercises: [
      { type: 'roleplay', scenario: 'market_shopping' },
      { type: 'listening', focus: 'prices' },
      { type: 'speaking', focus: 'haggling' },
    ],
    languageSpecific: {
      spanish: {
        phrases: ['¿Cuánto cuesta?', '¿Cuánto es?', 'Es demasiado caro', '¿Tiene...?'],
        culturalNotes: 'haggling in markets common, bargaining expected',
      },
      french: {
        phrases: ['C\'est combien?', 'Ça coûte combien?', 'C\'est trop cher', 'Vous avez...?'],
        culturalNotes: 'fixed prices in stores, markets may negotiate',
      },
      german: {
        phrases: ['Was kostet das?', 'Wie viel kostet das?', 'Zu teuer', 'Haben Sie...?'],
        culturalNotes: 'cash still very common, fixed prices',
      },
      japanese: {
        phrases: ['いくらですか', '高すぎます', '...はありますか'],
        culturalNotes: 'no haggling, tax often added separately, staff very attentive',
        counters: 'different counters for items',
      },
      mandarin: {
        phrases: ['多少钱? (duōshao qián)', '太贵了', '便宜一点'],
        culturalNotes: 'haggling expected in markets, mobile payment very common',
      },
      korean: {
        phrases: ['얼마예요?', '너무 비싸요', '...있어요?'],
        culturalNotes: 'fixed prices, mobile payment ubiquitous',
      },
      arabic: {
        phrases: ['بكم هذا؟', 'غالي جداً', 'عندك...؟'],
        culturalNotes: 'haggling expected and part of culture, start low',
      },
    },
    aiRoleplay: {
      scenario: 'market_shopping',
      prompts: ['Act as vendor', 'Negotiate prices', 'Discuss quality', 'Complete transaction'],
    },
    unlocks: 'Can shop and discuss prices',
  },
  {
    id: 11,
    phase: 2,
    title: 'Directions & Transportation',
    description: 'Navigate and use public transportation',
    objectives: [
      'Ask for and give directions',
      'Discuss transportation options',
      'Use location vocabulary',
      'Read basic maps and signs',
    ],
    topics: ['directions', 'transportation', 'location', 'prepositions'],
    estimatedMinutes: 35,
    vocabulary: ['left', 'right', 'straight', 'turn', 'bus', 'train', 'taxi', 'subway', 'near', 'far', 'next_to', 'between'],
    grammar: ['prepositions_of_place', 'imperatives', 'location_phrases'],
    exercises: [
      { type: 'listening', focus: 'following_directions' },
      { type: 'speaking', focus: 'giving_directions' },
      { type: 'game', focus: 'virtual_navigation' },
    ],
    languageSpecific: {
      spanish: {
        phrases: ['¿Dónde está...?', 'Gire a la izquierda/derecha', 'Siga recto', 'Está cerca/lejos'],
        imperatives: 'formal commands for directions',
        culturalNotes: 'distances in metros/kilómetros',
      },
      french: {
        phrases: ['Où est...?', 'Tournez à gauche/droite', 'Allez tout droit', 'C\'est près/loin'],
        imperatives: 'vous form for polite directions',
        culturalNotes: 'Paris metro system, arrondissements',
      },
      german: {
        phrases: ['Wo ist...?', 'Biegen Sie links/rechts ab', 'Gehen Sie geradeaus', 'Es ist nah/weit'],
        separableVerbs: 'abbiegen, weitergehen',
        culturalNotes: 'efficient public transit, bikes common',
      },
      japanese: {
        phrases: ['...はどこですか', '左/右に曲がってください', 'まっすぐ行ってください'],
        counters: '一つ目の角 (first corner)',
        culturalNotes: 'addresses by district, train stations as landmarks',
      },
      mandarin: {
        phrases: ['...在哪里?', '左转/右转', '一直走', '很近/很远'],
        culturalNotes: 'bike sharing, subway systems, addresses by compound',
      },
      korean: {
        phrases: ['...어디 있어요?', '왼쪽/오른쪽으로 가세요', '직진하세요'],
        culturalNotes: 'excellent subway system, addresses by dong',
      },
      arabic: {
        phrases: ['أين...؟', 'انعطف يساراً/يميناً', 'على طول', 'قريب/بعيد'],
        culturalNotes: 'landmarks more important than street names',
      },
    },
    aiRoleplay: {
      scenario: 'navigate_city',
      prompts: ['User asks directions', 'Give complex directions', 'Suggest transportation', 'Confirm understanding'],
    },
    unlocks: 'Can navigate unfamiliar places',
  },
  {
    id: 12,
    phase: 2,
    title: 'Weather & Small Talk',
    description: 'Discuss weather and make casual conversation',
    objectives: [
      'Describe weather conditions',
      'Talk about seasons',
      'Make weather-related small talk',
      'Discuss future weather',
    ],
    topics: ['weather', 'seasons', 'small_talk', 'conversation_starters'],
    estimatedMinutes: 25,
    vocabulary: ['sunny', 'rainy', 'cloudy', 'hot', 'cold', 'snow', 'wind', 'spring', 'summer', 'fall', 'winter'],
    grammar: ['weather_expressions', 'its_construction', 'future_simple'],
    exercises: [
      { type: 'conversation', focus: 'small_talk' },
      { type: 'listening', focus: 'weather_forecast' },
      { type: 'speaking', focus: 'describing_weather' },
    ],
    languageSpecific: {
      spanish: {
        phrases: ['Hace calor/frío', 'Está lloviendo', 'Hace sol', '¿Qué tiempo hace?'],
        verb: 'hacer for weather (literally "to make")',
        culturalNotes: 'celsius system, rainy seasons vary by region',
      },
      french: {
        phrases: ['Il fait chaud/froid', 'Il pleut', 'Il fait beau', 'Quel temps fait-il?'],
        impersonal: 'il fait, il y a',
        culturalNotes: 'weather common conversation starter',
      },
      german: {
        phrases: ['Es ist warm/kalt', 'Es regnet', 'Es ist sonnig', 'Wie ist das Wetter?'],
        impersonal: 'es ist, es gibt',
        culturalNotes: 'changeable weather, Germans discuss weather often',
      },
      japanese: {
        phrases: ['暑い/寒いですね', '雨が降っています', 'いい天気ですね'],
        particles: 'が for weather phenomena',
        culturalNotes: 'four distinct seasons important culturally',
      },
      mandarin: {
        phrases: ['很热/很冷', '下雨', '晴天', '天气怎么样?'],
        culturalNotes: 'weather and health connected in culture',
      },
      korean: {
        phrases: ['더워요/추워요', '비가 와요', '날씨가 좋아요'],
        culturalNotes: 'monsoon season, four seasons',
      },
      arabic: {
        phrases: ['الجو حار/بارد', 'تمطر', 'مشمس', 'كيف الطقس؟'],
        culturalNotes: 'extreme heat in summer, weather impacts daily life',
      },
    },
    aiRoleplay: {
      scenario: 'casual_conversation',
      prompts: ['Start with weather', 'Discuss weekend plans', 'Comment on seasons', 'Make small talk'],
    },
    unlocks: 'Can make small talk naturally',
  },
  {
    id: 13,
    phase: 2,
    title: 'Present Tense Actions',
    description: 'Describe current and habitual actions',
    objectives: [
      'Use common verbs in present tense',
      'Describe daily routines',
      'Talk about frequency of actions',
      'Conjugate regular verbs',
    ],
    topics: ['present_tense', 'daily_routine', 'frequency', 'regular_verbs'],
    estimatedMinutes: 40,
    vocabulary: ['eat', 'drink', 'go', 'come', 'see', 'watch', 'read', 'write', 'work', 'study', 'sleep', 'wake_up'],
    grammar: ['present_tense_conjugation', 'frequency_adverbs', 'time_expressions'],
    exercises: [
      { type: 'conjugation', focus: 'regular_verbs' },
      { type: 'speaking', focus: 'daily_routine' },
      { type: 'writing', focus: 'describe_typical_day' },
    ],
    languageSpecific: {
      spanish: {
        conjugations: ['-ar (hablar)', '-er (comer)', '-ir (vivir)'],
        frequencyWords: ['siempre', 'a menudo', 'a veces', 'nunca'],
        specialNotes: 'stem-changing verbs introduced',
      },
      french: {
        conjugations: ['-er (parler)', '-ir (finir)', '-re (vendre)'],
        frequencyWords: ['toujours', 'souvent', 'parfois', 'jamais'],
        specialNotes: 'irregular verbs être, avoir, aller, faire',
      },
      german: {
        conjugations: ['weak verbs (machen)', 'strong verbs (fahren)'],
        frequencyWords: ['immer', 'oft', 'manchmal', 'nie'],
        specialNotes: 'separable verbs, verb-second position',
      },
      japanese: {
        conjugations: ['う-verbs', 'る-verbs', 'irregular (する、来る)'],
        frequencyWords: ['いつも', 'よく', '時々', '全然'],
        specialNotes: 'present tense also used for habitual actions',
      },
      mandarin: {
        noConjugation: true,
        frequencyWords: ['总是', '经常', '有时候', '从不'],
        aspectMarkers: '着 (zhe), 在 (zài) for ongoing',
      },
      korean: {
        conjugations: ['해요 form', '습니다/ㅂ니다 form'],
        frequencyWords: ['항상', '자주', '가끔', '절대'],
        specialNotes: 'verb endings show politeness level',
      },
      arabic: {
        conjugations: ['present tense prefixes and suffixes'],
        frequencyWords: ['دائماً', 'غالباً', 'أحياناً', 'أبداً'],
        specialNotes: 'present marked with prefixes, root system',
      },
    },
    aiRoleplay: {
      scenario: 'daily_routine_discussion',
      prompts: ['Ask about morning routine', 'Discuss work/study habits', 'Compare schedules', 'Talk about hobbies'],
    },
    unlocks: 'Can describe daily life and habits',
  },
  {
    id: 14,
    phase: 2,
    title: 'Likes & Dislikes',
    description: 'Express preferences and opinions',
    objectives: [
      'Express likes and dislikes',
      'Talk about hobbies and interests',
      'Give simple reasons',
      'Use degree words (love, hate, prefer)',
    ],
    topics: ['preferences', 'hobbies', 'opinions', 'reasoning'],
    estimatedMinutes: 30,
    vocabulary: ['like', 'love', 'hate', 'prefer', 'hobby', 'music', 'sports', 'movies', 'books', 'because'],
    grammar: ['verb_like', 'infinitives', 'gerunds', 'because_clause'],
    exercises: [
      { type: 'conversation', focus: 'preferences' },
      { type: 'speaking', focus: 'explaining_reasons' },
      { type: 'game', focus: 'preference_interview' },
    ],
    languageSpecific: {
      spanish: {
        verb: 'gustar (backwards construction)',
        phrases: ['Me gusta/gustan', 'Me encanta', 'Odio', 'Prefiero'],
        construction: 'indirect object + gustar + subject',
        because: 'porque',
      },
      french: {
        verbs: ['aimer', 'adorer', 'détester', 'préférer'],
        phrases: ['J\'aime', 'J\'adore', 'Je déteste', 'Je préfère'],
        infinitiveUse: 'J\'aime + infinitive',
        because: 'parce que',
      },
      german: {
        verbs: ['mögen', 'lieben', 'hassen', 'bevorzugen'],
        phrases: ['Ich mag', 'Ich liebe', 'Ich hasse', 'Ich bevorzuge'],
        wordOrder: 'because = weil (sends verb to end)',
        because: 'weil (subordinate clause)',
      },
      japanese: {
        phrases: ['好きです', '大好きです', '嫌いです'],
        particles: 'が or を with 好き',
        construction: 'noun + が + 好き',
        because: 'から or ので',
      },
      mandarin: {
        verbs: ['喜欢 (xǐhuan)', '爱', '讨厌', '更喜欢'],
        construction: 'subject + 喜欢 + object/verb',
        because: '因为 (yīnwèi)',
      },
      korean: {
        verbs: ['좋아하다', '사랑하다', '싫어하다'],
        construction: 'object + 을/를 + 좋아해요',
        because: '왜냐하면... 때문에',
      },
      arabic: {
        verbs: ['أحب', 'أعشق', 'أكره', 'أفضل'],
        construction: 'verb + object (masdar for verb object)',
        because: 'لأن',
      },
    },
    aiRoleplay: {
      scenario: 'getting_to_know_you',
      prompts: ['Ask about hobbies', 'Discuss music/movies', 'Find common interests', 'Explain preferences'],
    },
    unlocks: 'Can express and discuss preferences',
  },
  {
    id: 15,
    phase: 2,
    title: 'Making Plans',
    description: 'Discuss future plans and make arrangements',
    objectives: [
      'Express future intentions',
      'Make invitations',
      'Accept or decline invitations',
      'Suggest activities',
    ],
    topics: ['future', 'plans', 'invitations', 'suggestions'],
    estimatedMinutes: 30,
    vocabulary: ['want_to', 'going_to', 'will', 'tomorrow', 'next_week', 'tonight', 'weekend', 'free', 'busy'],
    grammar: ['future_constructions', 'want_to', 'lets_construction', 'invitation_forms'],
    exercises: [
      { type: 'roleplay', scenario: 'making_weekend_plans' },
      { type: 'conversation', focus: 'invitations' },
      { type: 'speaking', focus: 'suggesting_activities' },
    ],
    languageSpecific: {
      spanish: {
        future: ['ir a + infinitive', 'future tense'],
        phrases: ['Voy a...', 'Vamos a...', '¿Quieres...?', '¿Te gustaría...?'],
        lets: 'vamos a + infinitive',
      },
      french: {
        future: ['aller + infinitive', 'futur simple'],
        phrases: ['Je vais...', 'On va...', 'Tu veux...?', 'Ça te dit de...?'],
        lets: 'On + present tense',
      },
      german: {
        future: ['werden + infinitive', 'present with time expression'],
        phrases: ['Ich werde...', 'Wir gehen...', 'Möchtest du...?', 'Wollen wir...?'],
        lets: 'Lass uns... or wollen wir',
      },
      japanese: {
        future: ['present tense + time expression', 'つもり construction'],
        phrases: ['...するつもりです', '...ましょう', '...ませんか'],
        lets: '...ましょう',
      },
      mandarin: {
        future: ['会 (huì)', '要 (yào)', '打算 (dǎsuàn)'],
        phrases: ['我会...', '我要...', '我们去...吧'],
        lets: '我们...吧',
      },
      korean: {
        future: ['을/를 거예요', '을/를 게요', '겠어요'],
        phrases: ['...할 거예요', '...합시다', '...할래요?'],
        lets: '...합시다 or ...ㅂ시다',
      },
      arabic: {
        future: ['سوف or س prefix', 'present tense (context)'],
        phrases: ['سأذهب...', 'سنذهب...', 'هل تريد...?'],
        lets: 'دعنا or هيا',
      },
    },
    aiRoleplay: {
      scenario: 'making_plans_with_friend',
      prompts: ['Suggest activity', 'Discuss availability', 'Agree on time/place', 'Confirm plans'],
    },
    unlocks: 'Can make and discuss plans',
  },
  {
    id: 16,
    phase: 2,
    title: 'Past Tense Introduction',
    description: 'Talk about past events and experiences',
    objectives: [
      'Use simple past tense',
      'Describe what happened',
      'Use time expressions for past',
      'Handle common irregular verbs',
    ],
    topics: ['past_tense', 'time_expressions', 'narration', 'experiences'],
    estimatedMinutes: 40,
    vocabulary: ['yesterday', 'last_week', 'ago', 'before', 'then', 'first', 'after'],
    grammar: ['past_tense_regular', 'past_tense_irregular', 'past_time_markers'],
    exercises: [
      { type: 'conjugation', focus: 'past_tense' },
      { type: 'speaking', focus: 'what_did_you_do' },
      { type: 'storytelling', focus: 'simple_past_narrative' },
    ],
    languageSpecific: {
      spanish: {
        tenses: ['pretérito', 'imperfecto (introduced)'],
        phrases: ['Ayer fui...', 'La semana pasada...', 'Hace dos días'],
        irregulars: ['ir/ser (fui)', 'hacer (hice)', 'estar (estuve)'],
      },
      french: {
        tenses: ['passé composé (main)', 'imparfait (mentioned)'],
        phrases: ['Hier, je suis allé(e)...', 'La semaine dernière...', 'Il y a deux jours'],
        auxiliaries: 'avoir or être + past participle',
      },
      german: {
        tenses: ['Perfekt (main)', 'Präteritum (sein, haben)'],
        phrases: ['Gestern bin ich...', 'Letzte Woche...', 'Vor zwei Tagen'],
        structure: 'haben/sein + past participle (at end)',
      },
      japanese: {
        conjugation: ['ました (polite past)', 'た (casual past)'],
        phrases: ['昨日...ました', '先週', '...前'],
        specialNotes: 'た-form from て-form',
      },
      mandarin: {
        marker: '了 (le) for completed action',
        phrases: ['昨天我...了', '上个星期', '...以前'],
        specialNotes: 'past context often sufficient without marker',
      },
      korean: {
        conjugation: ['었/았어요', '었/았습니다'],
        phrases: ['어제...했어요', '지난 주', '...전에'],
        specialNotes: 'vowel harmony (ㅏ/ㅓ)',
      },
      arabic: {
        conjugation: 'past tense is base form',
        phrases: ['أمس...', 'الأسبوع الماضي', 'قبل...'],
        specialNotes: 'past tense suffixes based on subject',
      },
    },
    aiRoleplay: {
      scenario: 'discuss_yesterday',
      prompts: ['Ask what user did yesterday', 'Share experiences', 'Ask follow-up questions', 'Tell story'],
    },
    unlocks: 'Can talk about past experiences',
  },

  // PHASE 3: Communication (Lessons 17-24)
  {
    id: 17,
    phase: 3,
    title: 'Phone & Digital Communication',
    description: 'Handle phone calls and digital messaging',
    objectives: [
      'Make and receive phone calls',
      'Leave and understand messages',
      'Use texting conventions',
      'Make appointments',
    ],
    topics: ['phone', 'messaging', 'appointments', 'formal_calls'],
    estimatedMinutes: 30,
    vocabulary: ['phone', 'call', 'message', 'text', 'email', 'answer', 'busy', 'appointment', 'available'],
    grammar: ['modal_verbs_can_could', 'polite_requests', 'leaving_messages'],
    exercises: [
      { type: 'roleplay', scenario: 'phone_call' },
      { type: 'listening', focus: 'voicemail_messages' },
      { type: 'speaking', focus: 'making_appointment' },
    ],
    languageSpecific: {
      spanish: {
        phrases: ['¿Aló?/¿Diga?', '¿Puedo hablar con...?', 'Un momento, por favor', 'Déjame un mensaje'],
        formality: 'usted for unknown callers',
        textAbbreviations: ['tmb (también)', 'q (que)', 'xq (porque)'],
      },
      french: {
        phrases: ['Allô?', 'Je voudrais parler à...', 'Ne quittez pas', 'Laissez un message'],
        formality: 'vous unless very familiar',
        textAbbreviations: ['slt (salut)', 'bjr (bonjour)', 'mdr (laughing)'],
      },
      german: {
        phrases: ['Hier spricht...', 'Kann ich mit... sprechen?', 'Einen Moment bitte', 'Hinterlassen Sie eine Nachricht'],
        formality: 'Sie for professional calls',
        textAbbreviations: ['LG (Liebe Grüße)', 'MfG (Mit freundlichen Grüßen)'],
      },
      japanese: {
        phrases: ['もしもし', '...さんはいらっしゃいますか', '少々お待ちください', 'メッセージをどうぞ'],
        keigo: 'honorific language essential for business',
        textStyle: 'emoji usage different, LINE stickers',
      },
      mandarin: {
        phrases: ['喂?', '我找...', '请稍等', '请留言'],
        culturalNotes: 'WeChat dominant for messaging',
        textAbbreviations: ['886 (拜拜了)', '520 (我爱你)'],
      },
      korean: {
        phrases: ['여보세요', '...있어요?', '잠시만요', '메시지 남겨주세요'],
        honorifics: 'different levels for business vs personal',
        textAbbreviations: ['ㅋㅋ (laughing)', 'ㅇㅇ (yes)'],
      },
      arabic: {
        phrases: ['ألو؟', 'أريد أن أتحدث مع...', 'لحظة من فضلك', 'اترك رسالة'],
        culturalNotes: 'elaborate greetings common',
      },
    },
    aiRoleplay: {
      scenario: 'phone_conversation',
      prompts: ['Answer phone', 'Handle wrong number', 'Take message', 'Schedule appointment'],
    },
    unlocks: 'Can handle phone communications',
  },
  {
    id: 18,
    phase: 3,
    title: 'Emergencies & Help',
    description: 'Handle emergency situations and ask for help',
    objectives: [
      'Call for help in emergencies',
      'Describe health problems',
      'Report lost items',
      'Ask for assistance',
    ],
    topics: ['emergencies', 'health', 'help', 'problems', 'safety'],
    estimatedMinutes: 35,
    vocabulary: ['help', 'emergency', 'police', 'doctor', 'hospital', 'pain', 'sick', 'lost', 'accident'],
    grammar: ['need_verb', 'imperatives', 'urgent_expressions'],
    exercises: [
      { type: 'roleplay', scenario: 'emergency_situations' },
      { type: 'speaking', focus: 'describing_problems' },
      { type: 'listening', focus: 'emergency_instructions' },
    ],
    languageSpecific: {
      spanish: {
        phrases: ['¡Ayuda!', '¡Socorro!', 'Necesito un médico', 'Me duele...', 'He perdido...', 'Llame a la policía'],
        bodyParts: 'la cabeza, el estómago, la pierna',
        emergencyNumber: '112 in Spain, 911 in Latin America',
      },
      french: {
        phrases: ['Au secours!', 'À l\'aide!', 'J\'ai besoin d\'un médecin', 'J\'ai mal à...', 'J\'ai perdu...', 'Appelez la police'],
        bodyParts: 'la tête, le ventre, la jambe',
        emergencyNumber: '112',
      },
      german: {
        phrases: ['Hilfe!', 'Ich brauche einen Arzt', 'Mir tut... weh', 'Ich habe... verloren', 'Rufen Sie die Polizei'],
        bodyParts: 'der Kopf, der Bauch, das Bein',
        emergencyNumber: '112',
      },
      japanese: {
        phrases: ['助けて！', '医者が必要です', '...が痛いです', '...をなくしました', '警察を呼んでください'],
        bodyParts: '頭、お腹、足',
        emergencyNumber: '110 (police), 119 (ambulance/fire)',
      },
      mandarin: {
        phrases: ['救命！', '我需要医生', '我...疼', '我丢了...', '请叫警察'],
        bodyParts: '头、肚子、腿',
        emergencyNumber: '110 (police), 120 (ambulance)',
      },
      korean: {
        phrases: ['도와주세요!', '의사가 필요해요', '...가/이 아파요', '...를/을 잃어버렸어요', '경찰을 불러주세요'],
        bodyParts: '머리, 배, 다리',
        emergencyNumber: '112 (police), 119 (ambulance/fire)',
      },
      arabic: {
        phrases: ['النجدة!', 'أحتاج طبيب', 'يؤلمني...', 'فقدت...', 'اتصل بالشرطة'],
        bodyParts: 'الرأس، البطن، الساق',
        emergencyNumber: 'varies by country',
      },
    },
    aiRoleplay: {
      scenario: 'emergency_response',
      prompts: ['Respond to emergency call', 'Ask clarifying questions', 'Give instructions', 'Provide reassurance'],
    },
    unlocks: 'Can handle emergency situations',
  },
  {
    id: 19,
    phase: 3,
    title: 'Emotions & Feelings',
    description: 'Express and discuss emotions',
    objectives: [
      'Name various emotions',
      'Express how you feel',
      'Show sympathy and congratulations',
      'Make and respond to complaints',
    ],
    topics: ['emotions', 'feelings', 'sympathy', 'congratulations', 'complaints'],
    estimatedMinutes: 30,
    vocabulary: ['happy', 'sad', 'angry', 'tired', 'excited', 'worried', 'bored', 'surprised', 'feel'],
    grammar: ['feel_verb', 'causative_make_feel', 'emotion_expressions'],
    exercises: [
      { type: 'conversation', focus: 'emotional_discussion' },
      { type: 'roleplay', scenario: 'consoling_friend' },
      { type: 'speaking', focus: 'expressing_feelings' },
    ],
    languageSpecific: {
      spanish: {
        verb: 'sentirse',
        phrases: ['Me siento...', 'Estoy feliz/triste', '¡Qué lástima!', '¡Felicidades!', 'Lo siento'],
        serVsEstar: 'estar for temporary emotions',
      },
      french: {
        verb: 'se sentir',
        phrases: ['Je me sens...', 'Je suis content(e)/triste', 'Quel dommage!', 'Félicitations!', 'Je suis désolé(e)'],
        agreement: 'adjective agrees with subject',
      },
      german: {
        verb: 'sich fühlen',
        phrases: ['Ich fühle mich...', 'Ich bin glücklich/traurig', 'Wie schade!', 'Herzlichen Glückwunsch!', 'Es tut mir leid'],
        reflexive: 'sich fühlen is reflexive',
      },
      japanese: {
        expressions: ['...という気持ちです', '嬉しいです', '悲しいです'],
        phrases: ['残念ですね', 'おめでとうございます', 'ごめんなさい', 'お気の毒に'],
        culturalNotes: 'indirect emotion expression common',
      },
      mandarin: {
        verb: '觉得 (juéde) or 感到 (gǎndào)',
        phrases: ['我觉得...', '我很高兴/难过', '真可惜！', '恭喜！', '对不起'],
        intensifiers: '很、非常、特别',
      },
      korean: {
        expressions: ['...기분이 들어요', '기쁘다', '슬프다'],
        phrases: ['아쉽네요', '축하해요', '미안해요', '유감이에요'],
        levels: 'emotion words have formal/informal versions',
      },
      arabic: {
        verb: 'يشعر',
        phrases: ['أشعر بـ...', 'أنا سعيد/حزين', 'يا للأسف!', 'مبروك!', 'آسف'],
        agreement: 'adjectives agree in gender',
      },
    },
    aiRoleplay: {
      scenario: 'emotional_support',
      prompts: ['Share good/bad news', 'Respond appropriately', 'Offer comfort', 'Celebrate together'],
    },
    unlocks: 'Can discuss feelings and empathize',
  },
  {
    id: 20,
    phase: 3,
    title: 'Work & Studies',
    description: 'Discuss professional and academic life',
    objectives: [
      'Describe your job or studies',
      'Talk about skills and abilities',
      'Discuss work/study schedule',
      'Handle job interview basics',
    ],
    topics: ['work', 'studies', 'skills', 'abilities', 'professions'],
    estimatedMinutes: 35,
    vocabulary: ['job', 'work', 'study', 'university', 'company', 'boss', 'colleague', 'skill', 'can', 'ability'],
    grammar: ['can_could_able', 'work_at_as', 'present_perfect_intro'],
    exercises: [
      { type: 'conversation', focus: 'career_discussion' },
      { type: 'roleplay', scenario: 'job_interview' },
      { type: 'speaking', focus: 'describing_skills' },
    ],
    languageSpecific: {
      spanish: {
        phrases: ['Trabajo en/de...', 'Estudio...', 'Soy ingeniero/a', 'Puedo/Sé + infinitive'],
        serVsEstar: 'ser for professions',
        poder: 'poder (can - ability) vs saber (know how)',
      },
      french: {
        phrases: ['Je travaille dans/comme...', 'J\'étudie...', 'Je suis ingénieur', 'Je peux/Je sais + infinitive'],
        articles: 'profession without article after être',
        savoirVsPouvoir: 'savoir (know how) vs pouvoir (can)',
      },
      german: {
        phrases: ['Ich arbeite bei/als...', 'Ich studiere...', 'Ich bin Ingenieur', 'Ich kann + infinitive'],
        wordOrder: 'modal verb + infinitive at end',
        können: 'können (can - ability)',
      },
      japanese: {
        phrases: ['...で働いています', '...を勉強しています', '...ができます'],
        keigo: 'humble and honorific language for work context',
        particles: 'で for location, を for object',
      },
      mandarin: {
        phrases: ['我在...工作', '我学...', '我是工程师', '我会/能 + verb'],
        huìVsNéng: '会 (learned ability) vs 能 (can)',
        zài: '在 for location of work',
      },
      korean: {
        phrases: ['...에서 일해요', '...를/을 공부해요', '...할 수 있어요'],
        honorifics: 'humble verbs for own work',
        structure: '...ㄹ/을 수 있다 (can do)',
      },
      arabic: {
        phrases: ['أعمل في...', 'أدرس...', 'أنا مهندس', 'أستطيع + verb'],
        agreement: 'profession nouns have gender forms',
        verb: 'يستطيع (can)',
      },
    },
    aiRoleplay: {
      scenario: 'job_interview',
      prompts: ['Ask about experience', 'Discuss skills', 'Ask about availability', 'Describe responsibilities'],
    },
    unlocks: 'Can discuss professional life',
  },
  {
    id: 21,
    phase: 3,
    title: 'Advanced Questions & Clarification',
    description: 'Navigate misunderstandings and seek clarification',
    objectives: [
      'Ask for repetition',
      'Request clarification',
      'Ask for definitions',
      'Indicate lack of understanding',
    ],
    topics: ['clarification', 'comprehension', 'asking_for_help', 'meta_language'],
    estimatedMinutes: 25,
    vocabulary: ['repeat', 'understand', 'mean', 'say', 'slowly', 'explain', 'word', 'again'],
    grammar: ['indirect_questions', 'polite_requests', 'question_formation_review'],
    exercises: [
      { type: 'roleplay', scenario: 'clarification_practice' },
      { type: 'conversation', focus: 'handling_confusion' },
      { type: 'listening', focus: 'fast_speech_comprehension' },
    ],
    languageSpecific: {
      spanish: {
        phrases: [
          '¿Puede repetir, por favor?',
          '¿Qué significa...?',
          '¿Cómo se dice... en español?',
          'No entiendo',
          'Más despacio, por favor',
          '¿Puede explicar?'
        ],
      },
      french: {
        phrases: [
          'Pouvez-vous répéter, s\'il vous plaît?',
          'Qu\'est-ce que ça veut dire...?',
          'Comment dit-on... en français?',
          'Je ne comprends pas',
          'Plus lentement, s\'il vous plaît',
          'Pouvez-vous expliquer?'
        ],
      },
      german: {
        phrases: [
          'Können Sie das wiederholen, bitte?',
          'Was bedeutet...?',
          'Wie sagt man... auf Deutsch?',
          'Ich verstehe nicht',
          'Langsamer, bitte',
          'Können Sie das erklären?'
        ],
      },
      japanese: {
        phrases: [
          'もう一度言ってください',
          '...はどういう意味ですか',
          '日本語で何と言いますか',
          '分かりません',
          'もっとゆっくり話してください',
          '説明してください'
        ],
        keigo: 'polite request forms essential',
      },
      mandarin: {
        phrases: [
          '请再说一遍',
          '...是什么意思？',
          '...用中文怎么说？',
          '我不明白',
          '请说慢一点',
          '请解释一下'
        ],
      },
      korean: {
        phrases: [
          '다시 한번 말씀해 주세요',
          '...무슨 뜻이에요?',
          '...한국어로 뭐예요?',
          '이해 못했어요',
          '천천히 말씀해 주세요',
          '설명해 주세요'
        ],
      },
      arabic: {
        phrases: [
          'هل يمكن أن تكرر من فضلك؟',
          'ماذا يعني...؟',
          'كيف تقول... بالعربية؟',
          'لا أفهم',
          'ببطء من فضلك',
          'هل يمكن أن تشرح؟'
        ],
      },
    },
    aiRoleplay: {
      scenario: 'communication_breakdown',
      prompts: ['Speak unclearly initially', 'Use unknown words', 'Respond to clarification requests', 'Explain patiently'],
    },
    unlocks: 'Can navigate communication difficulties',
  },
  {
    id: 22,
    phase: 3,
    title: 'Opinions & Agreements',
    description: 'Express and discuss opinions',
    objectives: [
      'State opinions',
      'Agree and disagree politely',
      'Express uncertainty',
      'Debate simple topics',
    ],
    topics: ['opinions', 'agreement', 'disagreement', 'debate', 'politeness'],
    estimatedMinutes: 30,
    vocabulary: ['think', 'believe', 'opinion', 'agree', 'disagree', 'maybe', 'perhaps', 'probably'],
    grammar: ['opinion_verbs', 'subjunctive_intro', 'hedging_language'],
    exercises: [
      { type: 'conversation', focus: 'opinion_exchange' },
      { type: 'debate', topic: 'simple_current_topics' },
      { type: 'speaking', focus: 'polite_disagreement' },
    ],
    languageSpecific: {
      spanish: {
        phrases: [
          'Creo que...',
          'Pienso que...',
          'En mi opinión...',
          'Estoy de acuerdo',
          'No estoy de acuerdo',
          'Tal vez',
          'Quizás',
          'Probablemente'
        ],
        subjunctive: 'introduced with opinion verbs (no creo que + subjunctive)',
      },
      french: {
        phrases: [
          'Je pense que...',
          'Je crois que...',
          'À mon avis...',
          'Je suis d\'accord',
          'Je ne suis pas d\'accord',
          'Peut-être',
          'Probablement'
        ],
        subjunctive: 'je ne pense pas que + subjunctive',
      },
      german: {
        phrases: [
          'Ich denke, dass...',
          'Ich glaube, dass...',
          'Meiner Meinung nach...',
          'Ich bin einverstanden',
          'Ich bin nicht einverstanden',
          'Vielleicht',
          'Wahrscheinlich'
        ],
        wordOrder: 'dass sends verb to end',
      },
      japanese: {
        phrases: [
          '...と思います',
          '...だと考えています',
          '私の意見では...',
          '同意します',
          '賛成できません',
          'たぶん',
          'おそらく'
        ],
        softening: 'と思う softens assertions',
      },
      mandarin: {
        phrases: [
          '我认为...',
          '我觉得...',
          '我的意见是...',
          '我同意',
          '我不同意',
          '也许',
          '可能',
          '大概'
        ],
      },
      korean: {
        phrases: [
          '...라고 생각해요',
          '제 의견으로는...',
          '동의해요',
          '동의하지 않아요',
          '아마',
          '아마도',
          '...것 같아요'
        ],
        것같다: 'seems like (softener)',
      },
      arabic: {
        phrases: [
          'أعتقد أن...',
          'أظن أن...',
          'في رأيي...',
          'أوافق',
          'لا أوافق',
          'ربما',
          'من المحتمل'
        ],
      },
    },
    aiRoleplay: {
      scenario: 'friendly_debate',
      prompts: ['Introduce topic', 'Exchange opinions', 'Disagree respectfully', 'Find common ground'],
    },
    unlocks: 'Can engage in polite debate',
  },
  {
    id: 23,
    phase: 3,
    title: 'Comparisons',
    description: 'Compare people, places, and things',
    objectives: [
      'Make comparisons',
      'Use comparative and superlative forms',
      'Compare options when deciding',
      'Express preferences with reasons',
    ],
    topics: ['comparisons', 'comparative', 'superlative', 'preferences'],
    estimatedMinutes: 35,
    vocabulary: ['more', 'less', 'than', 'better', 'worse', 'best', 'worst', 'same', 'different', 'as...as'],
    grammar: ['comparative_forms', 'superlative_forms', 'comparison_structures'],
    exercises: [
      { type: 'speaking', focus: 'comparing_cities' },
      { type: 'conversation', focus: 'making_decisions' },
      { type: 'game', focus: 'comparison_quiz' },
    ],
    languageSpecific: {
      spanish: {
        comparative: 'más/menos + adjective + que',
        superlative: 'el/la más + adjective',
        irregular: ['mejor (better)', 'peor (worse)', 'mayor (older)', 'menor (younger)'],
        equality: 'tan + adjective + como',
      },
      french: {
        comparative: 'plus/moins + adjective + que',
        superlative: 'le/la plus + adjective',
        irregular: ['meilleur (better)', 'pire (worse)'],
        equality: 'aussi + adjective + que',
      },
      german: {
        comparative: 'adjective + -er + als',
        superlative: 'am + adjective + -sten or der/die/das + adjective + -ste',
        irregular: ['besser', 'mehr', 'lieber'],
        equality: 'so + adjective + wie',
        umlaut: 'many adjectives add umlaut (alt → älter)',
      },
      japanese: {
        comparative: '...より + adjective',
        superlative: '一番 + adjective',
        structure: 'AはBより adjective です',
        question: 'どちらが...か (which is more...?)',
      },
      mandarin: {
        comparative: '比 (bǐ) structure: A 比 B + adjective',
        superlative: '最 (zuì) + adjective',
        degree: '更 (gèng) - even more',
        equality: '跟...一样 + adjective',
      },
      korean: {
        comparative: '더 + adjective',
        comparison: '...보다 (than)',
        superlative: '가장/제일 + adjective',
        equality: '...만큼',
      },
      arabic: {
        comparative: 'أَفْعَل pattern (أكبر bigger)',
        superlative: 'same form as comparative with context',
        structure: 'أكبر من (bigger than)',
      },
    },
    aiRoleplay: {
      scenario: 'decision_making',
      prompts: ['Compare vacation destinations', 'Discuss pros and cons', 'Express preferences', 'Make final choice'],
    },
    unlocks: 'Can compare and contrast effectively',
  },
  {
    id: 24,
    phase: 3,
    title: 'Connecting Ideas',
    description: 'Link sentences and create coherent narratives',
    objectives: [
      'Use coordinating conjunctions',
      'Apply subordinating conjunctions',
      'Create sequential narratives',
      'Build paragraph-length discourse',
    ],
    topics: ['conjunctions', 'connectors', 'discourse_markers', 'narration'],
    estimatedMinutes: 35,
    vocabulary: ['and', 'but', 'or', 'so', 'because', 'first', 'then', 'after', 'finally', 'however', 'although'],
    grammar: ['conjunctions', 'discourse_markers', 'clause_connection'],
    exercises: [
      { type: 'writing', focus: 'paragraph_construction' },
      { type: 'speaking', focus: 'extended_narrative' },
      { type: 'storytelling', focus: 'coherent_story' },
    ],
    languageSpecific: {
      spanish: {
        coordinating: ['y/e', 'pero', 'o/u', 'sino'],
        subordinating: ['porque', 'aunque', 'cuando', 'si'],
        sequence: ['primero', 'luego', 'después', 'finalmente'],
        discourse: ['sin embargo', 'por lo tanto', 'además'],
      },
      french: {
        coordinating: ['et', 'mais', 'ou', 'donc'],
        subordinating: ['parce que', 'bien que', 'quand', 'si'],
        sequence: ['d\'abord', 'ensuite', 'puis', 'enfin'],
        discourse: ['cependant', 'donc', 'en plus'],
      },
      german: {
        coordinating: ['und', 'aber', 'oder', 'denn'],
        subordinating: ['weil', 'obwohl', 'wenn', 'dass'],
        sequence: ['zuerst', 'dann', 'danach', 'schließlich'],
        wordOrder: 'subordinating conjunctions send verb to end',
      },
      japanese: {
        coordinating: ['そして', 'でも', 'または', 'それで'],
        subordinating: ['から (because)', 'けど (but)', 'ので', 'のに'],
        sequence: ['まず', 'それから', 'その後', '最後に'],
        discourse: ['しかし', 'だから', 'また'],
      },
      mandarin: {
        coordinating: ['和', '但是', '或者', '所以'],
        subordinating: ['因为...所以', '虽然...但是', '如果...就'],
        sequence: ['首先', '然后', '接着', '最后'],
        discourse: ['然而', '因此', '另外'],
      },
      korean: {
        coordinating: ['그리고', '하지만', '또는', '그래서'],
        subordinating: ['...기 때문에', '...지만', '...면'],
        sequence: ['먼저', '그리고 나서', '그 다음에', '마지막으로'],
        discourse: ['그러나', '따라서', '게다가'],
      },
      arabic: {
        coordinating: ['و', 'لكن/لٰكِنْ', 'أو', 'ف'],
        subordinating: ['لأن', 'رغم أن', 'عندما', 'إذا'],
        sequence: ['أولاً', 'ثم', 'بعد ذلك', 'أخيراً'],
        discourse: ['ومع ذلك', 'لذلك', 'أيضاً'],
      },
    },
    aiRoleplay: {
      scenario: 'storytelling',
      prompts: ['Tell multi-event story', 'Ask user to tell story', 'Add complexity with conjunctions', 'Practice transitions'],
    },
    unlocks: 'Can create coherent longer narratives',
  },

  // PHASE 4: Fluency (Lessons 25-30)
  {
    id: 25,
    phase: 4,
    title: 'Cultural Context',
    description: 'Navigate cultural norms and social situations',
    objectives: [
      'Understand formal vs informal speech',
      'Recognize cultural taboos',
      'Use idiomatic expressions',
      'Adapt to cultural communication styles',
    ],
    topics: ['culture', 'idioms', 'formality', 'taboos', 'social_norms'],
    estimatedMinutes: 40,
    vocabulary: ['idioms', 'expressions', 'gestures', 'customs', 'traditions'],
    culturalTopics: ['formality_levels', 'gift_giving', 'dining_etiquette', 'personal_space', 'directness'],
    exercises: [
      { type: 'cultural_scenarios', focus: 'appropriate_responses' },
      { type: 'idiom_practice', focus: 'common_expressions' },
      { type: 'conversation', focus: 'cultural_awareness' },
    ],
    languageSpecific: {
      spanish: {
        formality: {
          tú: 'friends, family, peers, children',
          usted: 'elders, strangers, professional settings',
          vosotros: 'Spain informal plural',
          ustedes: 'formal plural (or all plural in Latin America)',
        },
        idioms: ['tomar el pelo', 'estar en las nubes', 'ser pan comido', 'costar un ojo de la cara'],
        culturalNotes: [
          'Late arrival acceptable (15-30 min)',
          'Lunch is main meal',
          'Kissing cheeks greeting',
          'Direct eye contact shows honesty',
        ],
      },
      french: {
        formality: {
          tu: 'friends, family, children, peers in casual settings',
          vous: 'strangers, professional, elders, or plural',
          transition: 'wait for older/senior person to suggest "tu"',
        },
        idioms: ['avoir le cafard', 'poser un lapin', 'casser les pieds', 'avoir un chat dans la gorge'],
        culturalNotes: [
          'Always greet shopkeepers',
          'Bread always on table, not plate',
          'Don\'t split bill item by item',
          'La bise (cheek kissing) varies by region',
        ],
      },
      german: {
        formality: {
          du: 'friends, family, children under 16, fellow students',
          Sie: 'adults you don\'t know well, professional settings',
          transition: 'formal offer: "Wollen wir uns duzen?"',
        },
        idioms: ['Schwein haben', 'jemandem die Daumen drücken', 'ins Fettnäpfchen treten', 'Tomaten auf den Augen haben'],
        culturalNotes: [
          'Punctuality very important',
          'Quiet hours (Ruhezeit) respected',
          'Direct communication preferred',
          'Birthday person brings cake to work',
        ],
      },
      japanese: {
        formality: {
          levels: ['casual', 'polite (です/ます)', 'honorific (keigo)', 'humble (kenjougo)'],
          usage: 'default to polite, keigo for customers/superiors',
        },
        idioms: ['猫をかぶる', '目から鱗', '猿も木から落ちる', '石の上にも三年'],
        culturalNotes: [
          'Bowing depth shows respect level',
          'Remove shoes indoors',
          'Slurping noodles acceptable',
          'Indirect communication preferred',
          'Don\'t stick chopsticks upright in rice',
          'Business cards received with two hands',
        ],
      },
      mandarin: {
        formality: {
          你: 'informal, peers, friends',
          您: 'formal, elders, respect',
          usage: 'err on side of 您 initially',
        },
        idioms: ['马马虎虎', '对牛弹琴', '画蛇添足', '井底之蛙'],
        culturalNotes: [
          'Gift giving has specific etiquette',
          'Number 8 lucky, 4 unlucky',
          'Both hands when giving/receiving',
          'Saving face crucial',
          'Pour tea for others before yourself',
        ],
      },
      korean: {
        formality: {
          levels: ['banmal (반말)', 'jondaetmal (존댓말)', 'formal (합니다)', 'honorific'],
          usage: 'age and status determine level',
          ageImportance: 'asking age appropriate to determine speech level',
        },
        idioms: ['식은 죽 먹기', '발 없는 말이 천리 간다', '누워서 떡 먹기'],
        culturalNotes: [
          'Age hierarchy very important',
          'Pour drinks with two hands',
          'Turn away when drinking from elder',
          'Shoes off indoors',
          'Youngest often pays for group',
        ],
      },
      arabic: {
        formality: {
          usage: 'generally more formal, honorifics common',
          greetings: 'elaborate greetings show respect',
        },
        idioms: ['على قلبي', 'إن شاء الله', 'ما شاء الله', 'الله يعطيك العافية'],
        culturalNotes: [
          'Right hand for eating/greeting',
          'Hospitality very important',
          'Shoes off often expected',
          'Same-gender socializing common',
          'Refuse offers 2-3 times before accepting',
          'Inshallah used frequently',
        ],
      },
    },
    aiRoleplay: {
      scenario: 'cultural_situations',
      prompts: ['Business meeting', 'Family dinner', 'Gift exchange', 'Navigate faux pas'],
    },
    unlocks: 'Can navigate cultural contexts appropriately',
  },
  {
    id: 26,
    phase: 4,
    title: 'Travel Situations',
    description: 'Handle comprehensive travel scenarios',
    objectives: [
      'Check in and out of hotels',
      'Ask for tourist recommendations',
      'Handle travel problems',
      'Make complaints politely',
    ],
    topics: ['travel', 'hotels', 'tourism', 'complaints', 'recommendations'],
    estimatedMinutes: 35,
    vocabulary: ['hotel', 'reservation', 'room', 'key', 'luggage', 'tourist_attraction', 'tour', 'ticket', 'problem'],
    grammar: ['conditional_would', 'polite_complaints', 'recommendations'],
    exercises: [
      { type: 'roleplay', scenario: 'hotel_check_in' },
      { type: 'conversation', focus: 'tourist_information' },
      { type: 'speaking', focus: 'problem_resolution' },
    ],
    languageSpecific: {
      spanish: {
        hotelPhrases: [
          'Tengo una reserva',
          'Quisiera hacer el check-in',
          '¿A qué hora es el check-out?',
          'Hay un problema con...',
        ],
        touristPhrases: [
          '¿Qué me recomienda visitar?',
          '¿Dónde puedo comprar entradas?',
          '¿Está lejos de aquí?',
        ],
        complaints: ['Disculpe, pero...', 'Me gustaría cambiar de habitación'],
      },
      french: {
        hotelPhrases: [
          'J\'ai une réservation',
          'Je voudrais faire l\'enregistrement',
          'À quelle heure est le check-out?',
          'Il y a un problème avec...',
        ],
        touristPhrases: [
          'Qu\'est-ce que vous recommandez?',
          'Où puis-je acheter des billets?',
          'C\'est loin d\'ici?',
        ],
        complaints: ['Excusez-moi, mais...', 'Je voudrais changer de chambre'],
      },
      german: {
        hotelPhrases: [
          'Ich habe eine Reservierung',
          'Ich möchte einchecken',
          'Um wie viel Uhr ist der Check-out?',
          'Es gibt ein Problem mit...',
        ],
        touristPhrases: [
          'Was empfehlen Sie?',
          'Wo kann ich Tickets kaufen?',
          'Ist das weit von hier?',
        ],
        complaints: ['Entschuldigung, aber...', 'Ich hätte gern ein anderes Zimmer'],
      },
      japanese: {
        hotelPhrases: [
          '予約しています',
          'チェックインをお願いします',
          'チェックアウトは何時ですか',
          '...に問題があります',
        ],
        touristPhrases: [
          'おすすめの観光地はどこですか',
          'チケットはどこで買えますか',
          'ここから遠いですか',
        ],
        complaints: ['すみませんが...', '部屋を変えていただけますか'],
        keigo: 'service industry uses honorific language',
      },
      mandarin: {
        hotelPhrases: [
          '我有预订',
          '我要办理入住',
          '退房时间是几点?',
          '...有问题',
        ],
        touristPhrases: [
          '你推荐去哪里?',
          '在哪里可以买票?',
          '离这里远吗?',
        ],
        complaints: ['不好意思，...', '我想换房间'],
      },
      korean: {
        hotelPhrases: [
          '예약했어요',
          '체크인하고 싶어요',
          '체크아웃 시간이 언제예요?',
          '...문제가 있어요',
        ],
        touristPhrases: [
          '어디를 추천하세요?',
          '표를 어디서 살 수 있어요?',
          '여기서 멀어요?',
        ],
        complaints: ['죄송하지만...', '방을 바꾸고 싶어요'],
      },
      arabic: {
        hotelPhrases: [
          'عندي حجز',
          'أريد تسجيل الدخول',
          'متى وقت المغادرة؟',
          'هناك مشكلة في...',
        ],
        touristPhrases: [
          'ماذا تنصح أن أزور؟',
          'أين يمكنني شراء التذاكر؟',
          'هل هو بعيد من هنا؟',
        ],
        complaints: ['عذراً، لكن...', 'أريد تغيير الغرفة'],
      },
    },
    aiRoleplay: {
      scenario: 'full_travel_day',
      prompts: ['Hotel check-in with issue', 'Ask for recommendations', 'Book tour', 'Resolve problem'],
    },
    unlocks: 'Can handle comprehensive travel situations',
  },
  {
    id: 27,
    phase: 4,
    title: 'Social Events',
    description: 'Navigate parties and social gatherings',
    objectives: [
      'Make party small talk',
      'Give and receive compliments',
      'Make toasts and celebrate',
      'Say goodbye appropriately',
    ],
    topics: ['social_events', 'parties', 'compliments', 'celebrations', 'goodbyes'],
    estimatedMinutes: 30,
    vocabulary: ['party', 'celebration', 'birthday', 'toast', 'compliment', 'beautiful', 'congratulations', 'enjoy'],
    grammar: ['compliment_structure', 'celebration_expressions', 'extended_farewells'],
    exercises: [
      { type: 'roleplay', scenario: 'birthday_party' },
      { type: 'conversation', focus: 'mingling' },
      { type: 'speaking', focus: 'toasts_and_wishes' },
    ],
    languageSpecific: {
      spanish: {
        compliments: [
          'Qué + noun + tan + adjective (¡Qué casa tan bonita!)',
          'Te queda muy bien',
          'Me encanta tu...',
        ],
        celebrations: [
          '¡Feliz cumpleaños!',
          '¡Salud!',
          '¡Felicidades!',
          '¡Que lo pases bien!',
        ],
        farewells: ['Fue un placer', 'Nos vemos pronto', 'Cuídate'],
      },
      french: {
        compliments: [
          'Que tu es + adjective (Que tu es élégant!)',
          'Ça te va très bien',
          'J\'adore ton/ta...',
        ],
        celebrations: [
          'Joyeux anniversaire!',
          'Santé!',
          'Félicitations!',
          'Amuse-toi bien!',
        ],
        farewells: ['C\'était un plaisir', 'À bientôt', 'Prends soin de toi'],
      },
      german: {
        compliments: [
          'Das/Der/Die + verb + toll/schön',
          'Das steht dir gut',
          'Dein/Deine... gefällt mir sehr',
        ],
        celebrations: [
          'Alles Gute zum Geburtstag!',
          'Prost!',
          'Herzlichen Glückwunsch!',
          'Viel Spaß!',
        ],
        farewells: ['Es war mir ein Vergnügen', 'Bis bald', 'Pass auf dich auf'],
      },
      japanese: {
        compliments: [
          '...が素敵ですね',
          'お似合いですよ',
          '...がきれいですね',
        ],
        celebrations: [
          'お誕生日おめでとうございます',
          '乾杯！',
          'おめでとうございます',
          '楽しんでください',
        ],
        farewells: ['楽しかったです', 'またお会いしましょう', 'お気をつけて'],
        culturalNotes: 'excessive compliments can be awkward, humility expected',
      },
      mandarin: {
        compliments: [
          '你的...很漂亮',
          '很适合你',
          '我很喜欢你的...',
        ],
        celebrations: [
          '生日快乐！',
          '干杯！',
          '恭喜！',
          '玩得开心！',
        ],
        farewells: ['很高兴见到你', '下次见', '保重'],
      },
      korean: {
        compliments: [
          '...진짜 예쁘네요',
          '잘 어울려요',
          '...정말 멋있어요',
        ],
        celebrations: [
          '생일 축하해요!',
          '건배!',
          '축하해요!',
          '즐거운 시간 보내세요!',
        ],
        farewells: ['즐거웠어요', '다음에 또 봐요', '조심히 가세요/계세요'],
      },
      arabic: {
        compliments: [
          '...جميل جداً',
          'يناسبك',
          'أحب...ك',
        ],
        celebrations: [
          'عيد ميلاد سعيد!',
          'في صحتك!',
          'مبروك!',
          'استمتع!',
        ],
        farewells: ['كان من دواعي سروري', 'إلى اللقاء', 'اعتن بنفسك'],
      },
    },
    aiRoleplay: {
      scenario: 'virtual_party',
      prompts: ['Multiple AI characters', 'Mingle and chat', 'Exchange compliments', 'Make toast', 'Say goodbyes'],
    },
    unlocks: 'Can navigate social gatherings naturally',
  },
  {
    id: 28,
    phase: 4,
    title: 'Problem Solving',
    description: 'Navigate complex problems and negotiations',
    objectives: [
      'Explain complex problems',
      'Negotiate solutions',
      'Request and offer help',
      'Follow and give multi-step instructions',
    ],
    topics: ['problem_solving', 'negotiation', 'instructions', 'help', 'solutions'],
    estimatedMinutes: 35,
    vocabulary: ['problem', 'solution', 'help', 'fix', 'broken', 'works', 'doesn\'t work', 'step', 'instruction'],
    grammar: ['conditional_if_then', 'imperatives_sequence', 'passive_voice_intro'],
    exercises: [
      { type: 'roleplay', scenario: 'technical_problem' },
      { type: 'listening', focus: 'following_instructions' },
      { type: 'speaking', focus: 'explaining_problems' },
    ],
    languageSpecific: {
      spanish: {
        conditionals: 'Si + present, future/imperative',
        problemPhrases: [
          'No funciona',
          'Está roto/a',
          'Tengo un problema con...',
          '¿Me puede ayudar?',
        ],
        instructions: 'Imperative + luego + imperative',
        negotiation: 'Conditional (sería posible...)',
      },
      french: {
        conditionals: 'Si + présent, futur/impératif',
        problemPhrases: [
          'Ça ne marche pas',
          'C\'est cassé',
          'J\'ai un problème avec...',
          'Pouvez-vous m\'aider?',
        ],
        instructions: 'Impératif + puis + impératif',
        negotiation: 'Conditionnel (ce serait possible...)',
      },
      german: {
        conditionals: 'Wenn + ..., dann...',
        problemPhrases: [
          'Es funktioniert nicht',
          'Es ist kaputt',
          'Ich habe ein Problem mit...',
          'Können Sie mir helfen?',
        ],
        instructions: 'Imperativ + dann + Imperativ',
        negotiation: 'Konjunktiv II (wäre es möglich...)',
      },
      japanese: {
        conditionals: 'と、たら、ば、なら forms',
        problemPhrases: [
          '動きません',
          '壊れています',
          '...に問題があります',
          '助けていただけますか',
        ],
        instructions: 'て-form連続',
        negotiation: 'Could形 (...していただけますか)',
      },
      mandarin: {
        conditionals: '如果...，就...',
        problemPhrases: [
          '不工作',
          '坏了',
          '我有问题...',
          '你能帮我吗?',
        ],
        instructions: 'Sequential verbs',
        negotiation: '可以...吗?',
      },
      korean: {
        conditionals: '...면, ...ㄹ/을 경우',
        problemPhrases: [
          '작동하지 않아요',
          '고장났어요',
          '...에 문제가 있어요',
          '도와주실 수 있어요?',
        ],
        instructions: '...고, ...아/어서',
        negotiation: '...ㄹ/을 수 있을까요?',
      },
      arabic: {
        conditionals: 'إذا/إن...',
        problemPhrases: [
          'لا يعمل',
          'مكسور',
          'عندي مشكلة في...',
          'هل يمكنك مساعدتي?',
        ],
        instructions: 'Imperative sequences',
        negotiation: 'هل يمكن...?',
      },
    },
    aiRoleplay: {
      scenario: 'complex_problem_solving',
      prompts: ['Present problem', 'Ask clarifying questions', 'Suggest solutions', 'Guide through fix'],
    },
    unlocks: 'Can solve complex problems collaboratively',
  },
  {
    id: 29,
    phase: 4,
    title: 'Storytelling & Jokes',
    description: 'Tell engaging stories and understand humor',
    objectives: [
      'Structure coherent narratives',
      'Use timing and delivery',
      'Understand cultural humor',
      'Tell anecdotes naturally',
    ],
    topics: ['storytelling', 'humor', 'jokes', 'anecdotes', 'narrative_structure'],
    estimatedMinutes: 35,
    vocabulary: ['story', 'funny', 'happened', 'suddenly', 'surprise', 'ending', 'punchline'],
    grammar: ['narrative_tenses', 'reported_speech', 'dramatic_expressions'],
    exercises: [
      { type: 'storytelling', focus: '5_minute_story' },
      { type: 'conversation', focus: 'sharing_anecdotes' },
      { type: 'listening', focus: 'jokes_and_humor' },
    ],
    languageSpecific: {
      spanish: {
        narrativeTenses: 'pretérito (events) + imperfecto (background)',
        storytellingPhrases: [
          'Érase una vez...',
          'De repente...',
          '¿Y sabes qué pasó?',
          'Al final...',
        ],
        humor: 'wordplay (juegos de palabras) common',
        culturalJokes: 'Jaimito jokes, regional humor',
      },
      french: {
        narrativeTenses: 'passé composé (events) + imparfait (background)',
        storytellingPhrases: [
          'Il était une fois...',
          'Tout à coup...',
          'Et tu sais quoi?',
          'Finalement...',
        ],
        humor: 'wordplay, irony common',
        culturalJokes: 'Belgian jokes, regional stereotypes',
      },
      german: {
        narrativeTenses: 'Präteritum (written) + Perfekt (spoken)',
        storytellingPhrases: [
          'Es war einmal...',
          'Plötzlich...',
          'Und weißt du was?',
          'Am Ende...',
        ],
        humor: 'dry humor, wordplay (Wortspiele)',
        culturalJokes: 'regional stereotypes (Bavarians, etc.)',
      },
      japanese: {
        narrativeTenses: 'past tense + た-form',
        storytellingPhrases: [
          'むかしむかし...',
          '突然...',
          'そしたら...',
          '結局...',
        ],
        humor: 'puns (だじゃれ), situational humor',
        culturalNotes: 'self-deprecating humor common, sarcasm less so',
      },
      mandarin: {
        narrativeTenses: '了, 过 aspect markers',
        storytellingPhrases: [
          '从前...',
          '突然...',
          '你知道吗?',
          '最后...',
        ],
        humor: 'wordplay, puns (homophone-based)',
        culturalJokes: 'regional stereotypes, historical references',
      },
      korean: {
        narrativeTenses: 'past tense (었/았)',
        storytellingPhrases: [
          '옛날에...',
          '갑자기...',
          '그런데 있잖아...',
          '결국...',
        ],
        humor: 'puns (말장난), situational comedy',
        culturalNotes: 'self-deprecating humor, variety show style',
      },
      arabic: {
        narrativeTenses: 'past tense (main), present for vividness',
        storytellingPhrases: [
          'كان يا ما كان...',
          'فجأة...',
          'وتعرف ماذا؟',
          'في النهاية...',
        ],
        humor: 'poetry, wordplay, rhetorical questions',
        culturalJokes: 'Juha stories, regional humor',
      },
    },
    aiRoleplay: {
      scenario: 'story_exchange',
      prompts: ['Tell funny story', 'Ask user for story', 'React appropriately', 'Share anecdotes'],
    },
    unlocks: 'Can tell engaging stories naturally',
  },
  {
    id: 30,
    phase: 4,
    title: 'Free Conversation',
    description: 'Engage in unstructured natural conversation',
    objectives: [
      'Maintain extended conversation',
      'Switch topics naturally',
      'Use active listening cues',
      'Respond spontaneously',
    ],
    topics: ['conversation', 'spontaneity', 'topic_switching', 'active_listening', 'fluency'],
    estimatedMinutes: 45,
    vocabulary: ['all_previous_lessons'],
    grammar: ['integrated_review'],
    exercises: [
      { type: 'conversation', focus: '15_minute_unstructured', duration: 15 },
      { type: 'conversation', focus: 'multiple_topics', duration: 10 },
      { type: 'assessment', focus: 'fluency_check' },
    ],
    languageSpecific: {
      all: {
        conversationStrategies: [
          'Ask follow-up questions',
          'Share related experiences',
          'Express agreement/disagreement',
          'Request clarification when needed',
          'Use filler words naturally',
          'Transition between topics smoothly',
        ],
        activeListening: [
          'Really?',
          'I see',
          'That\'s interesting',
          'Tell me more',
          'I understand',
        ],
      },
      spanish: {
        fillerWords: ['pues', 'bueno', 'entonces', 'o sea', 'vale'],
        listening: ['¿De veras?', 'Ya veo', 'Qué interesante', 'Cuéntame más'],
        transitions: ['Por cierto...', 'Eso me recuerda...', 'Cambiando de tema...'],
      },
      french: {
        fillerWords: ['bon', 'ben', 'alors', 'euh', 'quoi'],
        listening: ['Vraiment?', 'Je vois', 'C\'est intéressant', 'Dis-m\'en plus'],
        transitions: ['Au fait...', 'Ça me rappelle...', 'Sinon...'],
      },
      german: {
        fillerWords: ['also', 'na ja', 'halt', 'eben', 'mal'],
        listening: ['Wirklich?', 'Ach so', 'Das ist interessant', 'Erzähl mir mehr'],
        transitions: ['Übrigens...', 'Das erinnert mich an...', 'Apropos...'],
      },
      japanese: {
        fillerWords: ['あの', 'えっと', 'まあ', 'そうですね'],
        listening: ['本当に？', 'なるほど', '面白いですね', 'もっと聞かせて'],
        transitions: ['そういえば...', 'ところで...', 'それで...'],
        aizuchi: 'back-channeling crucial (うん、はい、そう)',
      },
      mandarin: {
        fillerWords: ['那个', '就是说', '然后', '嗯'],
        listening: ['真的吗？', '我明白', '很有意思', '告诉我更多'],
        transitions: ['对了...', '这让我想起...', '顺便说...'],
      },
      korean: {
        fillerWords: ['음', '그', '이제', '뭐', '좀'],
        listening: ['정말？', '그렇구나', '재미있네', '더 얘기해 줘'],
        transitions: ['그나저나...', '그거 들어서 생각났는데...', '그런데...'],
        backChanneling: '네, 응, 그래요',
      },
      arabic: {
        fillerWords: ['يعني', 'طيب', 'والله', 'إذن'],
        listening: ['فعلاً？', 'فهمت', 'هذا ممتع', 'أخبرني أكثر'],
        transitions: ['بالمناسبة...', 'هذا يذكرني بـ...', 'على فكرة...'],
      },
    },
    aiRoleplay: {
      scenario: 'natural_conversation',
      prompts: [
        'Start casual conversation',
        'Follow user\'s lead',
        'Introduce new topics naturally',
        'Ask open-ended questions',
        'Share experiences',
        'React authentically',
      ],
      topics: [
        'hobbies',
        'travel',
        'food',
        'movies',
        'books',
        'current_events',
        'personal_experiences',
        'dreams_and_plans',
      ],
    },
    assessment: {
      criteria: [
        'Can maintain 15+ minute conversation',
        'Understands 80%+ of conversational speech',
        'Responds without long pauses',
        'Uses varied vocabulary',
        'Applies multiple grammar structures',
        'Sounds natural and fluent',
      ],
    },
    unlocks: 'Has achieved basic conversational fluency!',
  },
];

/**
 * Get language-specific adaptation for a lesson
 */
export const getLessonContent = (lessonId, targetLanguage) => {
  const lesson = LESSONS.find(l => l.id === lessonId);
  if (!lesson) return null;

  return {
    ...lesson,
    languageAdaptations: LANGUAGE_ADAPTATIONS[targetLanguage] || {},
    languageSpecificContent: lesson.languageSpecific?.[targetLanguage] || lesson.languageSpecific?.all || {},
  };
};

/**
 * Get all lessons for a specific phase
 */
export const getLessonsByPhase = (phase) => {
  return LESSONS.filter(lesson => lesson.phase === phase);
};

/**
 * Get lesson progress requirements
 */
export const getLessonRequirements = (lessonId) => {
  const requirements = {
    1: { prerequisiteLessons: [] },
    2: { prerequisiteLessons: [1] },
  };

  // Most lessons require the previous lesson
  for (let i = 3; i <= 30; i++) {
    requirements[i] = { prerequisiteLessons: [i - 1] };
  }

  // Phase transitions require all previous lessons in phase
  requirements[9] = { prerequisiteLessons: [1, 2, 3, 4, 5, 6, 7, 8] };
  requirements[17] = { prerequisiteLessons: [9, 10, 11, 12, 13, 14, 15, 16] };
  requirements[25] = { prerequisiteLessons: [17, 18, 19, 20, 21, 22, 23, 24] };

  return requirements[lessonId] || { prerequisiteLessons: [lessonId - 1] };
};

export { LESSONS, LANGUAGE_ADAPTATIONS };
export default LESSONS;
