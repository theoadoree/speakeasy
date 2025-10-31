//
//  AuthView.swift
//  SpeakEasy
//
//  Unified authentication screen with Apple and Google Sign In
//

import SwiftUI
import AuthenticationServices

struct AuthView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationView {
            ZStack {
                Color(.systemBackground)
                    .ignoresSafeArea()

                VStack(spacing: 40) {
                    Spacer()

                    // Logo and Title
                    VStack(spacing: 16) {
                        // Logo placeholder - will show conversation bubble icon until logo is added
                        Image(systemName: "message.fill")
                            .font(.system(size: 80))
                            .foregroundColor(.blue)
                            .shadow(color: .blue.opacity(0.3), radius: 10, x: 0, y: 5)

                        Text("SpeakEasy")
                            .font(.system(size: 42, weight: .bold))

                        Text("AI-Powered Language Learning")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }

                    Spacer()

                    // Social Login Buttons
                    VStack(spacing: 16) {
                        // Apple Sign In
                        SignInWithAppleButton(
                            .signIn,
                            onRequest: { request in
                                request.requestedScopes = [.fullName, .email]
                            },
                            onCompletion: { result in
                                handleAppleSignIn(result)
                            }
                        )
                        .signInWithAppleButtonStyle(.black)
                        .frame(height: 56)
                        .cornerRadius(12)

                        // Google Sign In
                        Button(action: handleGoogleSignIn) {
                            HStack(spacing: 12) {
                                Image(systemName: "globe")
                                    .font(.system(size: 20))
                                Text("Continue with Google")
                                    .font(.system(size: 17, weight: .semibold))
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
                            .background(Color(.systemBackground))
                            .foregroundColor(.primary)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color(.separator), lineWidth: 1.5)
                            )
                        }
                        .cornerRadius(12)
                        .disabled(isLoading)

                        // Error Message
                        if let error = errorMessage {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.red)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                    }
                    .padding(.horizontal, 32)

                    Spacer()
                        .frame(height: 60)
                }
            }
            .navigationBarHidden(true)
        }
    }

    // MARK: - Apple Sign In Handler
    private func handleAppleSignIn(_ result: Result<ASAuthorization, Error>) {
        isLoading = true
        errorMessage = nil

        switch result {
        case .success(let authorization):
            if let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential {
                Task {
                    await authManager.signInWithApple(
                        userId: appleIDCredential.user,
                        email: appleIDCredential.email,
                        fullName: appleIDCredential.fullName
                    )

                    if let error = authManager.errorMessage {
                        errorMessage = error
                    }

                    isLoading = false
                }
            }
        case .failure(let error):
            let nsError = error as NSError
            // Don't show error if user cancelled
            if nsError.code != 1001 {
                errorMessage = "Sign in failed. Please try again."
            }
            isLoading = false
        }
    }

    // MARK: - Google Sign In Handler
    private func handleGoogleSignIn() {
        isLoading = true
        errorMessage = nil

        Task {
            await authManager.signInWithGoogle()

            if let error = authManager.errorMessage {
                errorMessage = error
            }

            isLoading = false
        }
    }
}

#Preview {
    AuthView()
        .environmentObject(AuthenticationManager.shared)
}
