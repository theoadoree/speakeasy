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
    let createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case email
        case name
        case createdAt = "created_at"
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
