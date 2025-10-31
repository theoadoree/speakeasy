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
    @State private var debugMessage: String?

    var body: some View {
        NavigationView {
            ZStack {
                Color(.systemBackground)
                    .ignoresSafeArea()

                VStack(spacing: 40) {
                    Spacer()

                    // Logo and Title
                    VStack(spacing: 16) {
                        // Logo - Speech bubble icon with gradient effect
                        ZStack {
                            Circle()
                                .fill(
                                    LinearGradient(
                                        colors: [Color.blue, Color.blue.opacity(0.7)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    )
                                )
                                .frame(width: 120, height: 120)
                                .shadow(color: .blue.opacity(0.3), radius: 15, x: 0, y: 8)

                            Image(systemName: "message.fill")
                                .font(.system(size: 60))
                                .foregroundColor(.white)
                        }

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
                        .disabled(isLoading)

                        // Google Sign In
                        Button(action: handleGoogleSignIn) {
                            HStack(spacing: 12) {
                                if isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle())
                                } else {
                                    Image(systemName: "globe")
                                        .font(.system(size: 20))
                                }
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

                        // Loading indicator
                        if isLoading {
                            HStack(spacing: 8) {
                                ProgressView()
                                    .scaleEffect(0.8)
                                Text("Signing in...")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            .padding(.top, 8)
                        }

                        // Error Message
                        if let error = errorMessage {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.red)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                                .padding(.top, 8)
                        }

                        // Debug Message (shows auth state)
                        if let debug = debugMessage {
                            Text(debug)
                                .font(.caption2)
                                .foregroundColor(.orange)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                                .padding(.top, 4)
                        }
                    }
                    .padding(.horizontal, 32)

                    Spacer()
                        .frame(height: 60)
                }
            }
            .navigationBarHidden(true)
        }
        .onAppear {
            debugMessage = "Auth: \(authManager.isAuthenticated), Loading: \(authManager.isLoading)"
        }
    }

    // MARK: - Apple Sign In Handler
    private func handleAppleSignIn(_ result: Result<ASAuthorization, Error>) {
        isLoading = true
        errorMessage = nil
        debugMessage = "Apple Sign In started..."

        switch result {
        case .success(let authorization):
            if let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential {
                debugMessage = "Got Apple credentials, calling backend..."

                Task {
                    await authManager.signInWithApple(credential: appleIDCredential)

                    await MainActor.run {
                        if let error = authManager.errorMessage {
                            errorMessage = "Apple Sign In failed: \(error)"
                            debugMessage = "Backend error"
                        } else if authManager.isAuthenticated {
                            debugMessage = "✅ Authenticated! Should navigate now..."
                        } else {
                            errorMessage = "Sign in completed but not authenticated"
                            debugMessage = "Auth flag not set"
                        }
                        isLoading = false
                    }
                }
            }
        case .failure(let error):
            let nsError = error as NSError
            // Don't show error if user cancelled
            if nsError.code != 1001 {
                errorMessage = "Sign in failed. Please try again."
                debugMessage = "Apple auth error: \(nsError.code)"
            } else {
                debugMessage = "User cancelled"
            }
            isLoading = false
        }
    }

    // MARK: - Google Sign In Handler
    private func handleGoogleSignIn() {
        isLoading = true
        errorMessage = nil
        debugMessage = "Google Sign In started..."

        Task {
            await authManager.signInWithGoogle()

            await MainActor.run {
                if let error = authManager.errorMessage {
                    errorMessage = "Google Sign In failed: \(error)"
                    debugMessage = "Backend error: \(error)"
                } else if authManager.isAuthenticated {
                    debugMessage = "✅ Authenticated! Should navigate now..."
                } else {
                    errorMessage = "Sign in completed but not authenticated"
                    debugMessage = "Auth flag not set"
                }
                isLoading = false
            }
        }
    }
}

#Preview {
    AuthView()
        .environmentObject(AuthenticationManager.shared)
}
