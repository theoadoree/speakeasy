"""
30-Lesson Curriculum for SpeakEasy Language Learning
Each lesson includes: story, vocabulary, grammar point, and quiz
"""

LESSONS = [
    # Beginner Lessons (1-10)
    {
        "id": 1,
        "level": "beginner",
        "title": "Greetings and Introductions",
        "story": "Hello! My name is Maria. I am from Spain. Nice to meet you!",
        "vocabulary": ["hello", "name", "from", "nice", "meet"],
        "grammar": "Subject pronouns (I, you, he, she)",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "How do you say 'hello' in a formal way?",
                "options": ["Hola", "Buenos días", "Adiós", "Gracias"],
                "correct": "Buenos días"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "My _____ is Maria.",
                "correct": "name"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "What does 'Nice to meet you' mean?",
                "options": ["Goodbye", "Thank you", "Pleased to meet you", "How are you"],
                "correct": "Pleased to meet you"
            }
        ]
    },
    {
        "id": 2,
        "level": "beginner",
        "title": "Numbers 1-20",
        "story": "I have two cats and three dogs. My friend has five birds. Together we have ten pets!",
        "vocabulary": ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
        "grammar": "Cardinal numbers 1-20",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "How many pets does the narrator have?",
                "options": ["3", "5", "10", "2"],
                "correct": "5"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "I have _____ cats.",
                "correct": "two"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "What comes after 'nine'?",
                "options": ["eight", "ten", "eleven", "twelve"],
                "correct": "ten"
            }
        ]
    },
    {
        "id": 3,
        "level": "beginner",
        "title": "Family Members",
        "story": "This is my family. My mother is Ana and my father is Carlos. I have one sister and two brothers.",
        "vocabulary": ["mother", "father", "sister", "brother", "family"],
        "grammar": "Possessive adjectives (my, your, his, her)",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "How many siblings does the narrator have?",
                "options": ["1", "2", "3", "4"],
                "correct": "3"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "_____ mother is Ana.",
                "correct": "My"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "What is the mother's name?",
                "options": ["Carlos", "Ana", "Maria", "Pedro"],
                "correct": "Ana"
            }
        ]
    },
    {
        "id": 4,
        "level": "beginner",
        "title": "Colors and Clothes",
        "story": "I wear a blue shirt and black pants. My sister wears a red dress. Colors are beautiful!",
        "vocabulary": ["blue", "black", "red", "shirt", "pants", "dress"],
        "grammar": "Adjective-noun agreement",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "What color is the narrator's shirt?",
                "options": ["red", "blue", "black", "green"],
                "correct": "blue"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "My sister wears a _____ dress.",
                "correct": "red"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "What does the narrator wear on their legs?",
                "options": ["dress", "shirt", "pants", "shoes"],
                "correct": "pants"
            }
        ]
    },
    {
        "id": 5,
        "level": "beginner",
        "title": "Food and Drinks",
        "story": "For breakfast, I eat bread and drink coffee. My children prefer milk and cereal. We all like fruit!",
        "vocabulary": ["bread", "coffee", "milk", "cereal", "fruit", "breakfast"],
        "grammar": "Present tense - regular verbs (eat, drink, like)",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "What does the narrator drink for breakfast?",
                "options": ["milk", "water", "coffee", "juice"],
                "correct": "coffee"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "I _____ bread for breakfast.",
                "correct": "eat"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "What do everyone like?",
                "options": ["coffee", "cereal", "fruit", "bread"],
                "correct": "fruit"
            }
        ]
    },
    {
        "id": 6,
        "level": "beginner",
        "title": "Days of the Week",
        "story": "Monday is the first day. I work from Monday to Friday. On Saturday and Sunday, I rest.",
        "vocabulary": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "grammar": "Prepositions of time (on, from...to)",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "When does the narrator work?",
                "options": ["Monday to Friday", "Every day", "Only Monday", "Saturday and Sunday"],
                "correct": "Monday to Friday"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "_____ is the first day.",
                "correct": "Monday"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "What days does the narrator rest?",
                "options": ["Monday and Tuesday", "Wednesday and Thursday", "Saturday and Sunday", "Friday and Saturday"],
                "correct": "Saturday and Sunday"
            }
        ]
    },
    {
        "id": 7,
        "level": "beginner",
        "title": "Weather and Seasons",
        "story": "In summer, it is hot and sunny. In winter, it is cold and snowy. I like spring because it is warm.",
        "vocabulary": ["hot", "cold", "sunny", "snowy", "warm", "summer", "winter", "spring"],
        "grammar": "Weather expressions with 'it is'",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "What is the weather like in summer?",
                "options": ["cold and snowy", "hot and sunny", "warm", "rainy"],
                "correct": "hot and sunny"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "I like _____ because it is warm.",
                "correct": "spring"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "In winter, it is...",
                "options": ["hot", "warm", "cold", "sunny"],
                "correct": "cold"
            }
        ]
    },
    {
        "id": 8,
        "level": "beginner",
        "title": "Time and Daily Routine",
        "story": "I wake up at 7 o'clock. I eat breakfast at 8. I start work at 9. In the evening, I relax at home.",
        "vocabulary": ["wake up", "breakfast", "work", "evening", "relax", "o'clock"],
        "grammar": "Time expressions - at + time",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "What time does the narrator wake up?",
                "options": ["6 o'clock", "7 o'clock", "8 o'clock", "9 o'clock"],
                "correct": "7 o'clock"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "I start work _____ 9.",
                "correct": "at"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "When does the narrator relax?",
                "options": ["morning", "afternoon", "evening", "night"],
                "correct": "evening"
            }
        ]
    },
    {
        "id": 9,
        "level": "beginner",
        "title": "Places in the City",
        "story": "The supermarket is next to the bank. The hospital is near the park. I live between the school and the library.",
        "vocabulary": ["supermarket", "bank", "hospital", "park", "school", "library"],
        "grammar": "Prepositions of place (next to, near, between)",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "Where is the supermarket?",
                "options": ["near the park", "next to the bank", "between school and library", "in the hospital"],
                "correct": "next to the bank"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "The hospital is _____ the park.",
                "correct": "near"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "Where does the narrator live?",
                "options": ["next to the bank", "near the hospital", "between the school and library", "in the park"],
                "correct": "between the school and library"
            }
        ]
    },
    {
        "id": 10,
        "level": "beginner",
        "title": "Hobbies and Free Time",
        "story": "I like reading books and listening to music. My brother loves playing soccer. We both enjoy watching movies.",
        "vocabulary": ["reading", "listening", "music", "playing", "soccer", "watching", "movies"],
        "grammar": "Gerunds after 'like', 'love', 'enjoy'",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "What does the narrator like doing?",
                "options": ["playing soccer", "reading books", "cooking", "swimming"],
                "correct": "reading books"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "My brother loves _____ soccer.",
                "correct": "playing"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "What do both the narrator and brother enjoy?",
                "options": ["reading", "playing soccer", "watching movies", "listening to music"],
                "correct": "watching movies"
            }
        ]
    },

    # Intermediate Lessons (11-20)
    {
        "id": 11,
        "level": "intermediate",
        "title": "Past Tense - Simple Past",
        "story": "Yesterday, I visited my grandmother. She cooked a delicious meal. We talked for hours and had a wonderful time.",
        "vocabulary": ["visited", "cooked", "talked", "had", "yesterday", "delicious"],
        "grammar": "Simple past tense - regular and irregular verbs",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "When did the narrator visit their grandmother?",
                "options": ["today", "yesterday", "tomorrow", "last week"],
                "correct": "yesterday"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "She _____ a delicious meal. (cook)",
                "correct": "cooked"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "What is the past tense of 'have'?",
                "options": ["haved", "has", "had", "having"],
                "correct": "had"
            }
        ]
    },
    {
        "id": 12,
        "level": "intermediate",
        "title": "Future Plans - Going to",
        "story": "Next week, I am going to travel to Paris. I am going to visit the Eiffel Tower and eat French food.",
        "vocabulary": ["travel", "visit", "tower", "French", "next week"],
        "grammar": "Future with 'going to'",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "Where is the narrator going to travel?",
                "options": ["London", "Paris", "Rome", "Madrid"],
                "correct": "Paris"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "I am _____ to visit the Eiffel Tower.",
                "correct": "going"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "What is the narrator going to eat?",
                "options": ["Italian food", "Spanish food", "French food", "Chinese food"],
                "correct": "French food"
            }
        ]
    },
    {
        "id": 13,
        "level": "intermediate",
        "title": "Comparatives and Superlatives",
        "story": "This book is more interesting than that one. It is the best book I have ever read. The characters are stronger and braver.",
        "vocabulary": ["interesting", "best", "stronger", "braver", "than", "ever"],
        "grammar": "Comparative and superlative adjectives",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "What is the superlative form of 'good'?",
                "options": ["gooder", "better", "best", "most good"],
                "correct": "best"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "This book is more interesting _____ that one.",
                "correct": "than"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "What is the comparative form of 'strong'?",
                "options": ["strongest", "stronger", "more strong", "most strong"],
                "correct": "stronger"
            }
        ]
    },
    {
        "id": 14,
        "level": "intermediate",
        "title": "Modal Verbs - Can, Should, Must",
        "story": "You can speak three languages! That's amazing. You should practice every day. Students must complete their homework.",
        "vocabulary": ["can", "should", "must", "practice", "complete", "homework"],
        "grammar": "Modal verbs for ability, advice, and obligation",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "Which modal shows ability?",
                "options": ["should", "must", "can", "would"],
                "correct": "can"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "You _____ practice every day. (advice)",
                "correct": "should"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "Which modal shows obligation?",
                "options": ["can", "may", "must", "might"],
                "correct": "must"
            }
        ]
    },
    {
        "id": 15,
        "level": "intermediate",
        "title": "Present Perfect Tense",
        "story": "I have lived in this city for five years. She has visited ten countries. Have you ever tried sushi?",
        "vocabulary": ["have lived", "has visited", "ever", "tried", "for", "since"],
        "grammar": "Present perfect tense formation and usage",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "How long has the narrator lived in the city?",
                "options": ["three years", "five years", "ten years", "one year"],
                "correct": "five years"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "She _____ visited ten countries. (has/have)",
                "correct": "has"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "Which word is used with present perfect to ask about experience?",
                "options": ["never", "always", "ever", "often"],
                "correct": "ever"
            }
        ]
    },
    {
        "id": 16,
        "level": "intermediate",
        "title": "Conditional Sentences - First Conditional",
        "story": "If it rains tomorrow, I will stay home. If you study hard, you will pass the exam. What will you do if you win the lottery?",
        "vocabulary": ["if", "will", "rains", "study", "pass", "lottery"],
        "grammar": "First conditional (if + present, will + verb)",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "What will the narrator do if it rains?",
                "options": ["go out", "stay home", "work", "study"],
                "correct": "stay home"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "If you study hard, you _____ pass the exam.",
                "correct": "will"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "In first conditional, after 'if' we use...",
                "options": ["past tense", "present tense", "future tense", "present perfect"],
                "correct": "present tense"
            }
        ]
    },
    {
        "id": 17,
        "level": "intermediate",
        "title": "Passive Voice - Present and Past",
        "story": "English is spoken in many countries. This building was built in 1850. The letters are delivered every morning.",
        "vocabulary": ["spoken", "built", "delivered", "countries", "building", "letters"],
        "grammar": "Passive voice formation (be + past participle)",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "When was the building built?",
                "options": ["1750", "1850", "1950", "2000"],
                "correct": "1850"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "English _____ spoken in many countries. (is/are)",
                "correct": "is"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "What is the passive form of 'They deliver letters'?",
                "options": ["Letters deliver them", "Letters are delivered", "They are delivered", "Delivered are letters"],
                "correct": "Letters are delivered"
            }
        ]
    },
    {
        "id": 18,
        "level": "intermediate",
        "title": "Reported Speech",
        "story": "She said that she was tired. He told me that he had finished the project. They asked if I wanted coffee.",
        "vocabulary": ["said", "told", "asked", "tired", "finished", "project"],
        "grammar": "Reported speech - statements and questions",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "What did she say?",
                "options": ["I am tired", "she was tired", "she is tired", "I was tired"],
                "correct": "she was tired"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "He _____ me that he had finished. (said/told)",
                "correct": "told"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "In reported speech, 'am' changes to...",
                "options": ["is", "are", "was", "were"],
                "correct": "was"
            }
        ]
    },
    {
        "id": 19,
        "level": "intermediate",
        "title": "Phrasal Verbs - Common Expressions",
        "story": "I get up at 6 AM. Please turn on the lights. We need to look after our environment. Don't give up on your dreams!",
        "vocabulary": ["get up", "turn on", "look after", "give up", "environment", "dreams"],
        "grammar": "Phrasal verbs - separable and inseparable",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "What does 'look after' mean?",
                "options": ["search for", "take care of", "look at", "come after"],
                "correct": "take care of"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "I _____ up at 6 AM every day.",
                "correct": "get"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "What does 'give up' mean?",
                "options": ["continue", "stop trying", "give away", "wake up"],
                "correct": "stop trying"
            }
        ]
    },
    {
        "id": 20,
        "level": "intermediate",
        "title": "Relative Clauses",
        "story": "The woman who lives next door is a doctor. This is the book that I recommended. People whose jobs involve travel are lucky.",
        "vocabulary": ["who", "that", "whose", "next door", "recommended", "involve"],
        "grammar": "Relative pronouns (who, which, that, whose)",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "What is the woman's profession?",
                "options": ["teacher", "doctor", "engineer", "lawyer"],
                "correct": "doctor"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "The woman _____ lives next door is a doctor.",
                "correct": "who"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "Which relative pronoun shows possession?",
                "options": ["who", "which", "that", "whose"],
                "correct": "whose"
            }
        ]
    },

    # Advanced Lessons (21-30)
    {
        "id": 21,
        "level": "advanced",
        "title": "Advanced Conditionals - Second and Third",
        "story": "If I were rich, I would travel the world. If she had studied harder, she would have passed. What would you do if you could change the past?",
        "vocabulary": ["were", "would", "had studied", "would have passed", "could", "change"],
        "grammar": "Second and third conditional sentences",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "Which conditional talks about impossible present situations?",
                "options": ["first", "second", "third", "zero"],
                "correct": "second"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "If I _____ rich, I would travel. (was/were)",
                "correct": "were"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "Third conditional refers to...",
                "options": ["present situations", "future possibilities", "past situations", "general truths"],
                "correct": "past situations"
            }
        ]
    },
    {
        "id": 22,
        "level": "advanced",
        "title": "Perfect Continuous Tenses",
        "story": "I have been working here for ten years. She had been waiting for hours before he arrived. By next year, they will have been living together for a decade.",
        "vocabulary": ["have been working", "had been waiting", "will have been living", "decade", "arrived"],
        "grammar": "Present, past, and future perfect continuous",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "How long has the narrator been working?",
                "options": ["five years", "ten years", "fifteen years", "one year"],
                "correct": "ten years"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "She _____ been waiting for hours.",
                "correct": "had"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "How long is a decade?",
                "options": ["5 years", "10 years", "20 years", "100 years"],
                "correct": "10 years"
            }
        ]
    },
    {
        "id": 23,
        "level": "advanced",
        "title": "Subjunctive Mood",
        "story": "It is essential that he be present at the meeting. I suggest that she study more. The teacher demanded that we submit our work on time.",
        "vocabulary": ["essential", "suggest", "demanded", "submit", "present", "on time"],
        "grammar": "Subjunctive mood after certain verbs and expressions",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "After 'suggest that', what form of verb do we use?",
                "options": ["past", "present", "infinitive", "base form"],
                "correct": "base form"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "It is essential that he _____ present. (be/is)",
                "correct": "be"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "Which verb requires subjunctive?",
                "options": ["think", "believe", "suggest", "know"],
                "correct": "suggest"
            }
        ]
    },
    {
        "id": 24,
        "level": "advanced",
        "title": "Inversion for Emphasis",
        "story": "Never have I seen such beauty. Rarely does she make mistakes. Only then did I understand the truth. Under no circumstances should you lie.",
        "vocabulary": ["never", "rarely", "only then", "under no circumstances", "beauty", "truth"],
        "grammar": "Inversion after negative adverbials",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "After 'Never', what comes next?",
                "options": ["subject + verb", "auxiliary + subject", "verb + subject", "object + verb"],
                "correct": "auxiliary + subject"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "Rarely _____ she make mistakes. (does/do)",
                "correct": "does"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "Which requires inversion?",
                "options": ["Sometimes I go", "Often she visits", "Never have I", "Usually they come"],
                "correct": "Never have I"
            }
        ]
    },
    {
        "id": 25,
        "level": "advanced",
        "title": "Advanced Modal Verbs",
        "story": "He must have forgotten our appointment. She might have been sleeping when I called. You should have told me earlier. They can't have finished already!",
        "vocabulary": ["must have", "might have been", "should have", "can't have", "appointment", "already"],
        "grammar": "Modal verbs + perfect infinitive for past speculation",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "'Must have + past participle' expresses...",
                "options": ["ability", "obligation", "strong certainty about the past", "advice"],
                "correct": "strong certainty about the past"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "You _____ have told me earlier. (should/must)",
                "correct": "should"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "'Can't have + past participle' means...",
                "options": ["impossible in the past", "possible in the past", "necessary in the past", "optional in the past"],
                "correct": "impossible in the past"
            }
        ]
    },
    {
        "id": 26,
        "level": "advanced",
        "title": "Cleft Sentences for Emphasis",
        "story": "It was John who broke the window. What I need is some peace and quiet. The thing that annoys me most is dishonesty. All I want is to be happy.",
        "vocabulary": ["broke", "peace", "quiet", "annoys", "dishonesty", "happiness"],
        "grammar": "Cleft sentences (it-cleft and wh-cleft)",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "Who broke the window?",
                "options": ["Mary", "John", "Peter", "Susan"],
                "correct": "John"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "_____ I need is some peace. (What/That)",
                "correct": "What"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "What annoys the speaker most?",
                "options": ["noise", "dishonesty", "laziness", "rudeness"],
                "correct": "dishonesty"
            }
        ]
    },
    {
        "id": 27,
        "level": "advanced",
        "title": "Ellipsis and Substitution",
        "story": "I wanted to call, but I didn't. She can speak five languages, and so can he. Are you coming? I hope so. This coffee is better than the one I had yesterday.",
        "vocabulary": ["didn't", "so can", "hope so", "better than", "the one"],
        "grammar": "Ellipsis and substitution to avoid repetition",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "What does 'I hope so' replace?",
                "options": ["a noun", "a verb", "a clause", "an adjective"],
                "correct": "a clause"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "She can speak five languages, and _____ can he.",
                "correct": "so"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "In 'I wanted to call, but I didn't', what is omitted after 'didn't'?",
                "options": ["want", "call", "wanted", "to call"],
                "correct": "call"
            }
        ]
    },
    {
        "id": 28,
        "level": "advanced",
        "title": "Discourse Markers and Cohesion",
        "story": "Furthermore, I believe education is crucial. Nevertheless, some people disagree. In addition to being smart, she is kind. On the other hand, we must consider the costs.",
        "vocabulary": ["furthermore", "nevertheless", "in addition to", "on the other hand", "crucial", "consider"],
        "grammar": "Advanced discourse markers and linking devices",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "Which discourse marker shows contrast?",
                "options": ["furthermore", "nevertheless", "in addition", "moreover"],
                "correct": "nevertheless"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "_____, I believe education is crucial. (Furthermore/However)",
                "correct": "Furthermore"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "'In addition to' is followed by...",
                "options": ["verb", "gerund or noun", "subject", "auxiliary"],
                "correct": "gerund or noun"
            }
        ]
    },
    {
        "id": 29,
        "level": "advanced",
        "title": "Nominalization and Academic Style",
        "story": "The discovery of electricity changed the world. His refusal to cooperate was unexpected. The development of technology has transformed communication. Her dedication to research is admirable.",
        "vocabulary": ["discovery", "refusal", "development", "dedication", "transformed", "admirable"],
        "grammar": "Nominalization - turning verbs into nouns",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "What is the verb form of 'discovery'?",
                "options": ["discovere", "discover", "discovering", "discovered"],
                "correct": "discover"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "The _____ of electricity changed the world. (discover)",
                "correct": "discovery"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "What does 'dedication' come from?",
                "options": ["dedicate", "dedicated", "dedicating", "dedicator"],
                "correct": "dedicate"
            }
        ]
    },
    {
        "id": 30,
        "level": "advanced",
        "title": "Idiomatic Expressions and Collocations",
        "story": "It's raining cats and dogs. Break a leg on your performance! She let the cat out of the bag. Time flies when you're having fun. That costs an arm and a leg!",
        "vocabulary": ["raining cats and dogs", "break a leg", "let the cat out", "time flies", "arm and a leg"],
        "grammar": "Common English idioms and their meanings",
        "quiz": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "What does 'raining cats and dogs' mean?",
                "options": ["animals falling", "raining heavily", "sunny weather", "light rain"],
                "correct": "raining heavily"
            },
            {
                "id": 2,
                "type": "fill_blank",
                "question": "_____ flies when you're having fun.",
                "correct": "Time"
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "'Costs an arm and a leg' means...",
                "options": ["free", "cheap", "very expensive", "painful"],
                "correct": "very expensive"
            }
        ]
    }
]

def get_lesson_by_id(lesson_id: int):
    """Get a specific lesson by ID"""
    for lesson in LESSONS:
        if lesson["id"] == lesson_id:
            return lesson
    return None

def get_lessons_by_level(level: str):
    """Get all lessons for a specific level"""
    return [lesson for lesson in LESSONS if lesson["level"] == level]

def get_all_lessons():
    """Get all 30 lessons"""
    return LESSONS
