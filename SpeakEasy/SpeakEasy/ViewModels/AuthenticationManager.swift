//
//  AuthenticationManager.swift
//  SpeakEasy
//
//  Manages authentication state and user session
//

import Foundation
import Combine

@MainActor
class AuthenticationManager: ObservableObject {
    static let shared = AuthenticationManager()

    @Published var user: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let apiService = APIService.shared
    private let userDefaultsHelper = UserDefaultsHelper.shared

    private init() {
        // Check for existing session on init
        Task {
            await validateSession()
        }
    }

    // MARK: - Authentication Methods
    func register(email: String, password: String, name: String) async {
        isLoading = true
        errorMessage = nil

        do {
            let response = try await apiService.register(email: email, password: password, name: name)
            user = response.data.user
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
            isAuthenticated = false
        }

        isLoading = false
    }

    func login(email: String, password: String) async {
        isLoading = true
        errorMessage = nil

        do {
            let response = try await apiService.login(email: email, password: password)
            user = response.data.user
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
            isAuthenticated = false
        }

        isLoading = false
    }

    func logout() {
        apiService.logout()
        user = nil
        isAuthenticated = false
        userDefaultsHelper.clearAllData()
    }

    func validateSession() async {
        // Check if we have a token first
        guard KeychainHelper.shared.getToken() != nil else {
            // No token, skip validation
            isAuthenticated = false
            isLoading = false
            return
        }

        isLoading = true

        do {
            let validatedUser = try await apiService.validateToken()
            user = validatedUser
            isAuthenticated = true
        } catch {
            // Token is invalid or expired
            user = nil
            isAuthenticated = false
        }

        isLoading = false
    }

    // MARK: - Validation Helpers
    func isValidEmail(_ email: String) -> Bool {
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }

    func isValidPassword(_ password: String) -> Bool {
        return password.count >= 6
    }
}
