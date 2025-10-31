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
