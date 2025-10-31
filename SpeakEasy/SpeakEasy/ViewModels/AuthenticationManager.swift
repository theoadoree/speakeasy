//
//  AuthenticationManager.swift
//  SpeakEasy
//
//  Manages authentication state and user session
//

import Foundation
import Combine
import AuthenticationServices
import GoogleSignIn

@MainActor
class AuthenticationManager: ObservableObject {
    static let shared = AuthenticationManager()

    @Published var user: User?
    @Published var isAuthenticated = false
    @Published var isLoading = true  // Start as true while checking session
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

    // MARK: - Social Authentication
    func signInWithApple(userId: String, email: String?, fullName: PersonNameComponents?) async {
        isLoading = true
        errorMessage = nil

        do {
            let response = try await apiService.signInWithApple(
                userId: userId,
                email: email,
                fullName: fullName
            )
            user = response.data.user
            isAuthenticated = true
        } catch {
            errorMessage = error.localizedDescription
            isAuthenticated = false
        }

        isLoading = false
    }

    func signInWithGoogle() async {
        isLoading = true
        errorMessage = nil

        do {
            // Get the root view controller
            guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let rootViewController = windowScene.windows.first?.rootViewController else {
                errorMessage = "Unable to find root view controller"
                isLoading = false
                return
            }

            // Configure Google Sign In
            let config = GIDConfiguration(clientID: "823510409781-7am96n366leset271qt9c8djo265u24n.apps.googleusercontent.com")
            GIDSignIn.sharedInstance.configuration = config

            // Sign in
            let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: rootViewController)

            // Send to backend
            if let idToken = result.user.idToken?.tokenString {
                let response = try await apiService.signInWithGoogle(idToken: idToken)
                user = response.data.user
                isAuthenticated = true
            } else {
                errorMessage = "Failed to get Google ID token"
                isAuthenticated = false
            }
        } catch {
            errorMessage = error.localizedDescription
            isAuthenticated = false
        }

        isLoading = false
    }

    // MARK: - User Existence Check
    func checkUserExists(email: String) async -> Bool {
        do {
            return try await apiService.checkUserExists(email: email)
        } catch {
            errorMessage = error.localizedDescription
            return false
        }
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
