//
//  SignUpView.swift
//  SpeakEasy
//
//  Sign up screen with email, password, and name
//

import SwiftUI

struct SignUpView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var authManager = AuthenticationManager.shared

    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""

    var body: some View {
        NavigationView {
            ZStack {
                Color(.systemBackground)
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        // Logo
                        Image(systemName: "message.fill")
                            .font(.system(size: 50))
                            .foregroundColor(.blue)
                            .padding(.top, 40)

                        Text("Create Account")
                            .font(.title)
                            .fontWeight(.bold)

                        // Sign Up Form
                        VStack(spacing: 16) {
                            // Name Field
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Name")
                                    .font(.subheadline)
                                    .fontWeight(.medium)

                                TextField("Your name", text: $name)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .textContentType(.name)
                            }

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

                                SecureField("At least 6 characters", text: $password)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .textContentType(.newPassword)
                            }

                            // Confirm Password Field
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Confirm Password")
                                    .font(.subheadline)
                                    .fontWeight(.medium)

                                SecureField("Re-enter password", text: $confirmPassword)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .textContentType(.newPassword)
                            }

                            // Password Validation Messages
                            if !password.isEmpty {
                                VStack(alignment: .leading, spacing: 4) {
                                    if password.count < 6 {
                                        ValidationMessage(text: "Password must be at least 6 characters", isValid: false)
                                    }
                                    if !confirmPassword.isEmpty && password != confirmPassword {
                                        ValidationMessage(text: "Passwords do not match", isValid: false)
                                    }
                                }
                            }

                            // Error Message
                            if let errorMessage = authManager.errorMessage {
                                Text(errorMessage)
                                    .font(.caption)
                                    .foregroundColor(.red)
                                    .multilineTextAlignment(.center)
                            }

                            // Sign Up Button
                            Button(action: handleSignUp) {
                                if authManager.isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                        .frame(maxWidth: .infinity)
                                } else {
                                    Text("Sign Up")
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

                        Spacer()
                    }
                }
            }
            .navigationBarItems(leading: Button("Cancel") {
                dismiss()
            })
        }
    }

    private var isValidForm: Bool {
        !name.isEmpty &&
        authManager.isValidEmail(email) &&
        authManager.isValidPassword(password) &&
        password == confirmPassword
    }

    private func handleSignUp() {
        Task {
            await authManager.register(email: email, password: password, name: name)
            if authManager.isAuthenticated {
                dismiss()
            }
        }
    }
}

struct ValidationMessage: View {
    let text: String
    let isValid: Bool

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: isValid ? "checkmark.circle.fill" : "xmark.circle.fill")
                .foregroundColor(isValid ? .green : .red)
                .font(.caption)
            Text(text)
                .font(.caption)
                .foregroundColor(isValid ? .green : .red)
        }
    }
}

#Preview {
    SignUpView()
}
