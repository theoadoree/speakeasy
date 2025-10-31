//
//  AuthView.swift
//  SpeakEasy
//
//  Unified authentication screen with email, Apple, and Google Sign In
//

import SwiftUI
import AuthenticationServices

struct AuthView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @State private var email = ""
    @State private var password = ""
    @State private var name = ""
    @State private var showingPasswordField = false
    @State private var showingNameField = false
    @State private var isLoading = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 32) {
                    // Logo and Title
                    VStack(spacing: 12) {
                        Image(systemName: "message.fill")
                            .font(.system(size: 70))
                            .foregroundColor(.blue)

                        Text("SpeakEasy")
                            .font(.system(size: 36, weight: .bold))

                        Text("AI-Powered Language Learning")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 40)

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
                        .frame(height: 50)
                        .cornerRadius(8)

                        // Google Sign In
                        Button(action: handleGoogleSignIn) {
                            HStack {
                                Image(systemName: "globe")
                                    .font(.system(size: 18))
                                Text("Continue with Google")
                                    .fontWeight(.semibold)
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color(.systemBackground))
                            .foregroundColor(.primary)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color(.separator), lineWidth: 1)
                            )
                        }
                        .cornerRadius(8)
                    }
                    .padding(.horizontal)

                    // Divider
                    HStack {
                        Rectangle()
                            .fill(Color(.separator))
                            .frame(height: 1)

                        Text("or")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .padding(.horizontal, 12)

                        Rectangle()
                            .fill(Color(.separator))
                            .frame(height: 1)
                    }
                    .padding(.horizontal)

                    // Email Authentication
                    VStack(spacing: 16) {
                        // Email Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Email")
                                .font(.subheadline)
                                .fontWeight(.medium)

                            TextField("your@email.com", text: $email)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .textContentType(.emailAddress)
                                .autocapitalization(.none)
                                .keyboardType(.emailAddress)
                                .onChange(of: email) {
                                    errorMessage = nil
                                }
                        }

                        // Password Field (shown when email is entered)
                        if showingPasswordField {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Password")
                                    .font(.subheadline)
                                    .fontWeight(.medium)

                                SecureField("Enter password", text: $password)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .textContentType(.password)
                            }
                            .transition(.move(edge: .top).combined(with: .opacity))
                        }

                        // Name Field (shown for new users)
                        if showingNameField {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Full Name")
                                    .font(.subheadline)
                                    .fontWeight(.medium)

                                TextField("John Doe", text: $name)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .textContentType(.name)
                            }
                            .transition(.move(edge: .top).combined(with: .opacity))
                        }

                        // Error Message
                        if let error = errorMessage {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.red)
                                .padding(.horizontal)
                        }

                        // Continue Button
                        Button(action: handleEmailAuth) {
                            if isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            } else {
                                Text(showingPasswordField ? "Continue" : "Next")
                                    .fontWeight(.semibold)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(email.isEmpty ? Color(.systemGray4) : Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                        .disabled(email.isEmpty || isLoading)
                    }
                    .padding(.horizontal)

                    Spacer()
                }
            }
            .navigationBarHidden(true)
        }
    }

    // MARK: - Apple Sign In Handler
    private func handleAppleSignIn(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let authorization):
            if let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential {
                Task {
                    await authManager.signInWithApple(
                        userId: appleIDCredential.user,
                        email: appleIDCredential.email,
                        fullName: appleIDCredential.fullName
                    )
                }
            }
        case .failure(let error):
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Google Sign In Handler
    private func handleGoogleSignIn() {
        Task {
            await authManager.signInWithGoogle()
        }
    }

    // MARK: - Email Auth Handler
    private func handleEmailAuth() {
        guard !email.isEmpty else { return }

        // Validate email format
        guard authManager.isValidEmail(email) else {
            errorMessage = "Please enter a valid email address"
            return
        }

        if !showingPasswordField {
            // First step: check if user exists
            Task {
                isLoading = true
                let exists = await authManager.checkUserExists(email: email)
                isLoading = false

                withAnimation {
                    showingPasswordField = true
                    if !exists {
                        showingNameField = true
                    }
                }
            }
        } else {
            // Second step: login or register
            guard !password.isEmpty else {
                errorMessage = "Please enter a password"
                return
            }

            guard authManager.isValidPassword(password) else {
                errorMessage = "Password must be at least 6 characters"
                return
            }

            Task {
                isLoading = true

                if showingNameField {
                    // New user - register
                    guard !name.isEmpty else {
                        errorMessage = "Please enter your name"
                        isLoading = false
                        return
                    }
                    await authManager.register(email: email, password: password, name: name)
                } else {
                    // Existing user - login
                    await authManager.login(email: email, password: password)
                }

                if let error = authManager.errorMessage {
                    errorMessage = error
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
