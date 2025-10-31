//
//  APIService.swift
//  SpeakEasy
//
//  Handles all API communication with the backend
//

import Foundation

class APIService {
    static let shared = APIService()

    // Production backend URL
    private let baseURL = "https://speakeasy-backend-823510409781.us-central1.run.app"

    private var authToken: String? {
        get { KeychainHelper.shared.getToken() }
        set {
            if let token = newValue {
                KeychainHelper.shared.saveToken(token)
            } else {
                KeychainHelper.shared.deleteToken()
            }
        }
    }

    private init() {}

    // MARK: - Generic Request Handler
    private func request<T: Decodable>(
        endpoint: String,
        method: String = "GET",
        body: [String: Any]? = nil,
        requiresAuth: Bool = true
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if requiresAuth, let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }

        switch httpResponse.statusCode {
        case 200...299:
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(T.self, from: data)
        case 401:
            authToken = nil
            throw APIError.unauthorized
        case 400...499:
            throw APIError.clientError(httpResponse.statusCode)
        case 500...599:
            throw APIError.serverError(httpResponse.statusCode)
        default:
            throw APIError.unknownError
        }
    }

    // MARK: - Authentication
    func register(email: String, password: String, name: String) async throws -> AuthResponse {
        let body: [String: Any] = [
            "email": email,
            "password": password,
            "name": name
        ]
        let response: AuthResponse = try await request(
            endpoint: "/api/auth/register",
            method: "POST",
            body: body,
            requiresAuth: false
        )
        authToken = response.data.token
        return response
    }

    func login(email: String, password: String) async throws -> AuthResponse {
        let body: [String: Any] = [
            "email": email,
            "password": password
        ]
        let response: AuthResponse = try await request(
            endpoint: "/api/auth/login",
            method: "POST",
            body: body,
            requiresAuth: false
        )
        authToken = response.data.token
        return response
    }

    func logout() {
        authToken = nil
    }

    func validateToken() async throws -> User {
        struct ValidateResponse: Codable {
            let success: Bool
            let data: User
        }
        let response: ValidateResponse = try await request(endpoint: "/api/auth/validate")
        return response.data
    }

    func signInWithApple(userId: String, email: String?, fullName: PersonNameComponents?) async throws -> AuthResponse {
        var body: [String: Any] = ["userId": userId]
        if let email = email {
            body["email"] = email
        }
        if let fullName = fullName {
            var nameDict: [String: String] = [:]
            if let givenName = fullName.givenName {
                nameDict["givenName"] = givenName
            }
            if let familyName = fullName.familyName {
                nameDict["familyName"] = familyName
            }
            body["fullName"] = nameDict
        }

        let response: AuthResponse = try await request(
            endpoint: "/api/auth/apple",
            method: "POST",
            body: body,
            requiresAuth: false
        )
        authToken = response.data.token
        return response
    }

    func signInWithGoogle(idToken: String) async throws -> AuthResponse {
        let body: [String: Any] = ["idToken": idToken]
        let response: AuthResponse = try await request(
            endpoint: "/api/auth/google",
            method: "POST",
            body: body,
            requiresAuth: false
        )
        authToken = response.data.token
        return response
    }

    func checkUserExists(email: String) async throws -> Bool {
        struct ExistsResponse: Codable {
            let exists: Bool
        }
        let body: [String: Any] = ["email": email]
        let response: ExistsResponse = try await request(
            endpoint: "/api/auth/check-email",
            method: "POST",
            body: body,
            requiresAuth: false
        )
        return response.exists
    }

    // MARK: - Story Generation
    func generateStory(profile: UserProfile) async throws -> Story {
        let body: [String: Any] = [
            "targetLanguage": profile.targetLanguage,
            "proficiencyLevel": profile.proficiencyLevel.rawValue,
            "interests": profile.interests,
            "preferredDifficulty": profile.preferredDifficulty.rawValue
        ]
        struct GenerateResponse: Codable {
            let success: Bool
            let data: Story
        }
        let response: GenerateResponse = try await request(
            endpoint: "/api/generate",
            method: "POST",
            body: body
        )
        return response.data
    }

    // MARK: - Word Explanation
    func explainWord(word: String, context: String, targetLanguage: String, nativeLanguage: String) async throws -> WordExplanation {
        let body: [String: Any] = [
            "word": word,
            "context": context,
            "targetLanguage": targetLanguage,
            "nativeLanguage": nativeLanguage
        ]
        struct ExplainResponse: Codable {
            let success: Bool
            let data: WordExplanation
        }
        let response: ExplainResponse = try await request(
            endpoint: "/api/explain-word",
            method: "POST",
            body: body
        )
        return response.data
    }

    // MARK: - Practice Conversation
    func sendMessage(message: String, conversationHistory: [Message], targetLanguage: String) async throws -> Message {
        let historyData = conversationHistory.map { msg in
            ["role": msg.role.rawValue, "content": msg.content]
        }
        let body: [String: Any] = [
            "message": message,
            "conversationHistory": historyData,
            "targetLanguage": targetLanguage
        ]
        struct MessageResponse: Codable {
            let success: Bool
            let data: MessageData
        }
        struct MessageData: Codable {
            let message: Message
        }
        let response: MessageResponse = try await request(
            endpoint: "/api/practice/message",
            method: "POST",
            body: body
        )
        return response.data.message
    }

    // MARK: - Lessons
    func getLessons(language: String, level: String) async throws -> [Lesson] {
        struct LessonsResponse: Codable {
            let success: Bool
            let data: [Lesson]
        }
        let body: [String: Any] = [
            "language": language,
            "level": level
        ]
        let response: LessonsResponse = try await request(
            endpoint: "/api/lessons",
            method: "POST",
            body: body
        )
        return response.data
    }

    func getLesson(lessonId: String) async throws -> Lesson {
        struct LessonResponse: Codable {
            let success: Bool
            let data: Lesson
        }
        let response: LessonResponse = try await request(
            endpoint: "/api/lessons/\(lessonId)"
        )
        return response.data
    }

    func saveLessonProgress(lessonId: String, progress: LessonProgress) async throws {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        let progressData = try encoder.encode(progress)
        let progressDict = try JSONSerialization.jsonObject(with: progressData) as! [String: Any]

        let body: [String: Any] = [
            "lessonId": lessonId,
            "progress": progressDict
        ]
        let _: EmptyResponse = try await request(
            endpoint: "/api/lessons/progress",
            method: "POST",
            body: body
        )
    }

    // MARK: - Quizzes
    func submitQuiz(quizId: String, answers: [String: String]) async throws -> QuizResult {
        struct QuizResultResponse: Codable {
            let success: Bool
            let data: QuizResult
        }
        let body: [String: Any] = [
            "quizId": quizId,
            "answers": answers
        ]
        let response: QuizResultResponse = try await request(
            endpoint: "/api/quizzes/submit",
            method: "POST",
            body: body
        )
        return response.data
    }

    // MARK: - XP Leagues
    func getCurrentLeague() async throws -> XPLeague {
        struct LeagueResponse: Codable {
            let success: Bool
            let data: XPLeague
        }
        let response: LeagueResponse = try await request(
            endpoint: "/api/leagues/current"
        )
        return response.data
    }

    func getLeagueHistory() async throws -> [XPLeague] {
        struct LeagueHistoryResponse: Codable {
            let success: Bool
            let data: [XPLeague]
        }
        let response: LeagueHistoryResponse = try await request(
            endpoint: "/api/leagues/history"
        )
        return response.data
    }

    func updateXP(amount: Int, activityType: String) async throws {
        let body: [String: Any] = [
            "amount": amount,
            "activityType": activityType
        ]
        let _: EmptyResponse = try await request(
            endpoint: "/api/xp/update",
            method: "POST",
            body: body
        )
    }

    // MARK: - Music Integration
    func searchMusicTracks(language: String, query: String? = nil, provider: String? = nil) async throws -> [MusicTrack] {
        struct TracksResponse: Codable {
            let success: Bool
            let data: [MusicTrack]
        }
        var body: [String: Any] = ["language": language]
        if let query = query {
            body["query"] = query
        }
        if let provider = provider {
            body["provider"] = provider
        }
        let response: TracksResponse = try await request(
            endpoint: "/api/music/search",
            method: "POST",
            body: body
        )
        return response.data
    }

    func getMusicPlaylists(language: String) async throws -> [MusicPlaylist] {
        struct PlaylistsResponse: Codable {
            let success: Bool
            let data: [MusicPlaylist]
        }
        let body: [String: Any] = ["language": language]
        let response: PlaylistsResponse = try await request(
            endpoint: "/api/music/playlists",
            method: "POST",
            body: body
        )
        return response.data
    }

    func getTrackLyrics(trackId: String) async throws -> MusicTrack {
        struct TrackResponse: Codable {
            let success: Bool
            let data: MusicTrack
        }
        let response: TrackResponse = try await request(
            endpoint: "/api/music/lyrics/\(trackId)"
        )
        return response.data
    }

    // MARK: - Level Assessment
    func startAssessment(targetLanguage: String) async throws -> LevelAssessment {
        struct AssessmentResponse: Codable {
            let success: Bool
            let data: LevelAssessment
        }
        let body: [String: Any] = ["targetLanguage": targetLanguage]
        let response: AssessmentResponse = try await request(
            endpoint: "/api/assessment/start",
            method: "POST",
            body: body
        )
        return response.data
    }

    func submitAssessment(answers: [String: String], targetLanguage: String) async throws -> AssessmentResult {
        struct AssessmentResultResponse: Codable {
            let success: Bool
            let data: AssessmentResult
        }
        let body: [String: Any] = [
            "answers": answers,
            "targetLanguage": targetLanguage
        ]
        let response: AssessmentResultResponse = try await request(
            endpoint: "/api/assessment/submit",
            method: "POST",
            body: body
        )
        return response.data
    }

    // MARK: - Health Check
    func healthCheck() async throws -> Bool {
        struct HealthResponse: Codable {
            let status: String
        }
        let response: HealthResponse = try await request(
            endpoint: "/health",
            requiresAuth: false
        )
        return response.status == "ok"
    }
}

// MARK: - Empty Response
struct EmptyResponse: Codable {
    let success: Bool
}

// MARK: - API Errors
enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case clientError(Int)
    case serverError(Int)
    case unknownError
    case decodingError

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .unauthorized:
            return "Unauthorized - please log in again"
        case .clientError(let code):
            return "Client error: \(code)"
        case .serverError(let code):
            return "Server error: \(code)"
        case .unknownError:
            return "An unknown error occurred"
        case .decodingError:
            return "Failed to decode response"
        }
    }
}
