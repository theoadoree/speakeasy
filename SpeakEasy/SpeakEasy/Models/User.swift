//
//  User.swift
//  SpeakEasy
//
//  Core data models for user authentication and profile
//

import Foundation

// MARK: - User Authentication
struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let username: String?
    let createdAt: Date?
    var authProvider: AuthProvider?
    var xp: Int?
    var currentStreak: Int?
    var longestStreak: Int?
    var weeklyXP: Int?
    var leagueRank: Int?
    var completedLessons: [String]?
    var currentLessonId: String?
    var lastActivityDate: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case email
        case name
        case username
        case createdAt = "created_at"
        case authProvider = "auth_provider"
        case xp
        case currentStreak = "current_streak"
        case longestStreak = "longest_streak"
        case weeklyXP = "weekly_xp"
        case leagueRank = "league_rank"
        case completedLessons = "completed_lessons"
        case currentLessonId = "current_lesson_id"
        case lastActivityDate = "last_activity_date"
    }

    enum AuthProvider: String, Codable {
        case email = "email"
        case google = "google"
        case apple = "apple"
    }
}

// MARK: - Authentication Response
struct AuthResponse: Codable {
    let success: Bool
    let data: AuthData
    let message: String?
}

struct AuthData: Codable {
    let token: String
    let user: User
}

// MARK: - User Profile
struct UserProfile: Codable {
    var nativeLanguage: String
    var targetLanguage: String
    var proficiencyLevel: ProficiencyLevel
    var learningGoals: [String]
    var interests: [String]
    var dailyGoalMinutes: Int
    var preferredDifficulty: DifficultyPreference

    enum ProficiencyLevel: String, Codable, CaseIterable {
        case beginner = "beginner"
        case elementary = "elementary"
        case intermediate = "intermediate"
        case upperIntermediate = "upper_intermediate"
        case advanced = "advanced"

        var displayName: String {
            switch self {
            case .beginner: return "Beginner (A1)"
            case .elementary: return "Elementary (A2)"
            case .intermediate: return "Intermediate (B1)"
            case .upperIntermediate: return "Upper Intermediate (B2)"
            case .advanced: return "Advanced (C1-C2)"
            }
        }
    }

    enum DifficultyPreference: String, Codable {
        case easier = "easier"
        case comfortable = "comfortable"
        case challenging = "challenging"
    }

    static var `default`: UserProfile {
        UserProfile(
            nativeLanguage: "English",
            targetLanguage: "Spanish",
            proficiencyLevel: .beginner,
            learningGoals: [],
            interests: [],
            dailyGoalMinutes: 15,
            preferredDifficulty: .comfortable
        )
    }
}

// MARK: - Content Models
struct Story: Codable, Identifiable {
    let id: String
    let title: String
    let content: String
    let language: String
    let difficultyLevel: String
    let createdAt: Date
    let topics: [String]
    let estimatedReadTime: Int // in minutes

    enum CodingKeys: String, CodingKey {
        case id
        case title
        case content
        case language
        case difficultyLevel = "difficulty_level"
        case createdAt = "created_at"
        case topics
        case estimatedReadTime = "estimated_read_time"
    }
}

// MARK: - Conversation Models
struct Conversation: Codable, Identifiable {
    let id: String
    var messages: [Message]
    let language: String
    let startedAt: Date
    var lastMessageAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case messages
        case language
        case startedAt = "started_at"
        case lastMessageAt = "last_message_at"
    }
}

struct Message: Codable, Identifiable {
    let id: String
    let role: MessageRole
    let content: String
    let timestamp: Date
    let language: String?

    enum MessageRole: String, Codable {
        case user = "user"
        case assistant = "assistant"
        case system = "system"
    }
}

// MARK: - Word Explanation
struct WordExplanation: Codable {
    let word: String
    let definition: String
    let translation: String
    let exampleSentence: String
    let pronunciation: String?
    let partOfSpeech: String?

    enum CodingKeys: String, CodingKey {
        case word
        case definition
        case translation
        case exampleSentence = "example_sentence"
        case pronunciation
        case partOfSpeech = "part_of_speech"
    }
}

// MARK: - Adaptive Layers
struct AdaptiveLayers: Codable {
    let original: String
    let simplified: String?
    let advanced: String?
    let explanation: String?
}

// MARK: - Language Options
struct Language {
    let code: String
    let name: String
    let nativeName: String
    let flag: String

    static let commonLanguages: [Language] = [
        Language(code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸"),
        Language(code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷"),
        Language(code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪"),
        Language(code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹"),
        Language(code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹"),
        Language(code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵"),
        Language(code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷"),
        Language(code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳"),
        Language(code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺"),
        Language(code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦")
    ]
}

// MARK: - Lesson Models
struct Lesson: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let lessonNumber: Int
    let language: String
    let difficultyLevel: String
    let content: LessonContent
    let quiz: Quiz
    let xpReward: Int
    let estimatedMinutes: Int
    var isCompleted: Bool
    var userProgress: LessonProgress?

    enum CodingKeys: String, CodingKey {
        case id
        case title
        case description
        case lessonNumber = "lesson_number"
        case language
        case difficultyLevel = "difficulty_level"
        case content
        case quiz
        case xpReward = "xp_reward"
        case estimatedMinutes = "estimated_minutes"
        case isCompleted = "is_completed"
        case userProgress = "user_progress"
    }
}

struct LessonContent: Codable {
    let sections: [LessonSection]
    let vocabulary: [VocabularyItem]
    let grammar: [GrammarPoint]
}

struct LessonSection: Codable, Identifiable {
    let id: String
    let title: String
    let content: String
    let audioURL: String?
    let exercises: [Exercise]

    enum CodingKeys: String, CodingKey {
        case id
        case title
        case content
        case audioURL = "audio_url"
        case exercises
    }
}

struct VocabularyItem: Codable, Identifiable {
    let id: String
    let word: String
    let translation: String
    let pronunciation: String
    let exampleSentence: String
    let audioURL: String?

    enum CodingKeys: String, CodingKey {
        case id
        case word
        case translation
        case pronunciation
        case exampleSentence = "example_sentence"
        case audioURL = "audio_url"
    }
}

struct GrammarPoint: Codable, Identifiable {
    let id: String
    let title: String
    let explanation: String
    let examples: [String]
}

struct Exercise: Codable, Identifiable {
    let id: String
    let type: ExerciseType
    let question: String
    let options: [String]?
    let correctAnswer: String
    let explanation: String

    enum ExerciseType: String, Codable {
        case multipleChoice = "multiple_choice"
        case fillInBlank = "fill_in_blank"
        case translation = "translation"
        case listening = "listening"
        case speaking = "speaking"
    }

    enum CodingKeys: String, CodingKey {
        case id
        case type
        case question
        case options
        case correctAnswer = "correct_answer"
        case explanation
    }
}

struct LessonProgress: Codable {
    var completedSections: [String]
    var completedExercises: [String]
    var score: Double
    var timeSpent: Int // seconds
    var lastAccessedAt: Date

    enum CodingKeys: String, CodingKey {
        case completedSections = "completed_sections"
        case completedExercises = "completed_exercises"
        case score
        case timeSpent = "time_spent"
        case lastAccessedAt = "last_accessed_at"
    }
}

// MARK: - Quiz Models
struct Quiz: Codable, Identifiable {
    let id: String
    let lessonId: String
    let questions: [QuizQuestion]
    let passingScore: Double
    let timeLimit: Int? // seconds

    enum CodingKeys: String, CodingKey {
        case id
        case lessonId = "lesson_id"
        case questions
        case passingScore = "passing_score"
        case timeLimit = "time_limit"
    }
}

struct QuizQuestion: Codable, Identifiable {
    let id: String
    let type: QuestionType
    let question: String
    let options: [String]?
    let correctAnswer: String
    let points: Int
    let explanation: String

    enum QuestionType: String, Codable {
        case multipleChoice = "multiple_choice"
        case trueFalse = "true_false"
        case fillInBlank = "fill_in_blank"
        case matching = "matching"
        case listening = "listening"
    }

    enum CodingKeys: String, CodingKey {
        case id
        case type
        case question
        case options
        case correctAnswer = "correct_answer"
        case points
        case explanation
    }
}

struct QuizResult: Codable {
    let quizId: String
    let lessonId: String
    let score: Double
    let totalQuestions: Int
    let correctAnswers: Int
    let xpEarned: Int
    let completedAt: Date
    let timeTaken: Int // seconds

    enum CodingKeys: String, CodingKey {
        case quizId = "quiz_id"
        case lessonId = "lesson_id"
        case score
        case totalQuestions = "total_questions"
        case correctAnswers = "correct_answers"
        case xpEarned = "xp_earned"
        case completedAt = "completed_at"
        case timeTaken = "time_taken"
    }
}

// MARK: - XP League Models
struct XPLeague: Codable, Identifiable {
    let id: String
    let name: String
    let tier: LeagueTier
    let weekStartDate: Date
    let weekEndDate: Date
    let participants: [LeagueParticipant]
    var userRank: Int?

    enum LeagueTier: String, Codable, CaseIterable {
        case bronze = "bronze"
        case silver = "silver"
        case gold = "gold"
        case platinum = "platinum"
        case diamond = "diamond"
        case master = "master"

        var displayName: String {
            rawValue.capitalized
        }

        var icon: String {
            switch self {
            case .bronze: return "🥉"
            case .silver: return "🥈"
            case .gold: return "🥇"
            case .platinum: return "💎"
            case .diamond: return "💠"
            case .master: return "👑"
            }
        }
    }

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case tier
        case weekStartDate = "week_start_date"
        case weekEndDate = "week_end_date"
        case participants
        case userRank = "user_rank"
    }
}

struct LeagueParticipant: Codable, Identifiable {
    let id: String
    let username: String
    let weeklyXP: Int
    let rank: Int
    let avatar: String?
    let isCurrentUser: Bool

    enum CodingKeys: String, CodingKey {
        case id
        case username
        case weeklyXP = "weekly_xp"
        case rank
        case avatar
        case isCurrentUser = "is_current_user"
    }
}

// MARK: - Music Integration Models
struct MusicTrack: Codable, Identifiable {
    let id: String
    let title: String
    let artist: String
    let language: String
    let lyrics: String?
    let translatedLyrics: String?
    let provider: MusicProvider
    let providerTrackId: String
    let albumArt: String?
    let previewURL: String?
    let difficultyLevel: String?

    enum MusicProvider: String, Codable {
        case appleMusic = "apple_music"
        case spotify = "spotify"
    }

    enum CodingKeys: String, CodingKey {
        case id
        case title
        case artist
        case language
        case lyrics
        case translatedLyrics = "translated_lyrics"
        case provider
        case providerTrackId = "provider_track_id"
        case albumArt = "album_art"
        case previewURL = "preview_url"
        case difficultyLevel = "difficulty_level"
    }
}

struct MusicPlaylist: Codable, Identifiable {
    let id: String
    let name: String
    let language: String
    let tracks: [MusicTrack]
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case language
        case tracks
        case createdAt = "created_at"
    }
}

// MARK: - Level Assessment Models
struct LevelAssessment: Codable {
    let questions: [AssessmentQuestion]
    let estimatedLevel: UserProfile.ProficiencyLevel?
    let confidence: Double?

    enum CodingKeys: String, CodingKey {
        case questions
        case estimatedLevel = "estimated_level"
        case confidence
    }
}

struct AssessmentQuestion: Codable, Identifiable {
    let id: String
    let question: String
    let options: [String]
    let correctAnswer: String
    let difficultyLevel: UserProfile.ProficiencyLevel

    enum CodingKeys: String, CodingKey {
        case id
        case question
        case options
        case correctAnswer = "correct_answer"
        case difficultyLevel = "difficulty_level"
    }
}

struct AssessmentResult: Codable {
    let estimatedLevel: UserProfile.ProficiencyLevel
    let confidence: Double
    let correctAnswers: Int
    let totalQuestions: Int
    let recommendations: [String]

    enum CodingKeys: String, CodingKey {
        case estimatedLevel = "estimated_level"
        case confidence
        case correctAnswers = "correct_answers"
        case totalQuestions = "total_questions"
        case recommendations
    }
}
