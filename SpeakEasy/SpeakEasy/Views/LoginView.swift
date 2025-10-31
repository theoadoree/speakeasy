//
//  LoginView.swift
//  SpeakEasy
//
//  Login screen with email and password
//

import SwiftUI

struct LoginView: View {
    @StateObject private var authManager = AuthenticationManager.shared
    @State private var email = ""
    @State private var password = ""
    @State private var showingSignUp = false

    var body: some View {
        NavigationView {
            ZStack {
                Color(.systemBackground)
                    .ignoresSafeArea()

                VStack(spacing: 24) {
                    // Logo and Title
                    VStack(spacing: 8) {
                        Image(systemName: "message.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.blue)

                        Text("SpeakEasy")
                            .font(.largeTitle)
                            .fontWeight(.bold)

                        Text("AI-Powered Language Learning")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.bottom, 40)

                    // Login Form
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
                        }

                        // Password Field
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Password")
                                .font(.subheadline)
                                .fontWeight(.medium)

                            SecureField("Enter password", text: $password)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .textContentType(.password)
                        }

                        // Error Message
                        if let errorMessage = authManager.errorMessage {
                            Text(errorMessage)
                                .font(.caption)
                                .foregroundColor(.red)
                                .multilineTextAlignment(.center)
                        }

                        // Login Button
                        Button(action: handleLogin) {
                            if authManager.isLoading {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    .frame(maxWidth: .infinity)
                            } else {
                                Text("Log In")
                                    .fontWeight(.semibold)
                                    .frame(maxWidth: .infinity)
                            }
                        }
                        .frame(height: 50)
                        .background(isValidForm ? Color.blue : Color.gray)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                        .disabled(!isValidForm || authManager.isLoading)
                    }
                    .padding(.horizontal)

                    // Sign Up Link
                    HStack {
                        Text("Don't have an account?")
                            .foregroundColor(.secondary)

                        Button("Sign Up") {
                            showingSignUp = true
                        }
                        .fontWeight(.semibold)
                    }
                    .padding(.top, 8)

                    Spacer()
                }
                .padding()
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showingSignUp) {
                SignUpView()
            }
        }
    }

    private var isValidForm: Bool {
        authManager.isValidEmail(email) && authManager.isValidPassword(password)
    }

    private func handleLogin() {
        Task {
            await authManager.login(email: email, password: password)
        }
    }
}

#Preview {
    LoginView()
}
