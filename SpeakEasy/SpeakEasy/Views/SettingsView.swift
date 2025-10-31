//
//  SettingsView.swift
//  SpeakEasy
//
//  Settings and account management
//

import SwiftUI

struct SettingsView: View {
    @StateObject private var authManager = AuthenticationManager.shared
    @StateObject private var appManager = AppManager.shared
    @State private var showingLogoutAlert = false
    @State private var backendStatus: BackendStatus = .unknown

    enum BackendStatus {
        case unknown, checking, connected, disconnected
    }

    var body: some View {
        NavigationView {
            List {
                // User Profile Section
                Section {
                    if let user = authManager.user {
                        HStack {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 50))
                                .foregroundColor(.blue)

                            VStack(alignment: .leading, spacing: 4) {
                                Text(user.name ?? "User")
                                    .font(.headline)

                                Text(user.email)
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(.vertical, 8)
                    }
                }

                // Learning Profile Section
                if let profile = appManager.userProfile {
                    Section("Learning Profile") {
                        NavigationLink {
                            LanguageSettingsView(profile: $appManager.userProfile)
                        } label: {
                            SettingRow(
                                icon: "globe",
                                title: "Target Language",
                                value: profile.targetLanguage
                            )
                        }

                        NavigationLink {
                            ProficiencySettingsView(profile: $appManager.userProfile)
                        } label: {
                            SettingRow(
                                icon: "chart.bar",
                                title: "Proficiency Level",
                                value: profile.proficiencyLevel.displayName
                            )
                        }

                        NavigationLink {
                            InterestsSettingsView(profile: $appManager.userProfile)
                        } label: {
                            SettingRow(
                                icon: "star",
                                title: "Interests",
                                value: "\(profile.interests.count) selected"
                            )
                        }
                    }
                }

                // Backend Status Section
                Section("Backend Connection") {
                    HStack {
                        Image(systemName: statusIcon)
                            .foregroundColor(statusColor)

                        Text("Status")

                        Spacer()

                        Text(statusText)
                            .foregroundColor(.secondary)
                    }

                    Button {
                        checkBackendConnection()
                    } label: {
                        HStack {
                            Image(systemName: "arrow.clockwise")
                            Text("Test Connection")
                        }
                    }
                    .disabled(backendStatus == .checking)
                }

                // About Section
                Section("About") {
                    SettingRow(
                        icon: "info.circle",
                        title: "Version",
                        value: "1.0.0"
                    )

                    Link(destination: URL(string: "https://github.com/yourusername/speakeasy")!) {
                        SettingRow(
                            icon: "link",
                            title: "GitHub",
                            value: ""
                        )
                    }
                }

                // Account Section
                Section {
                    Button(role: .destructive) {
                        showingLogoutAlert = true
                    } label: {
                        HStack {
                            Image(systemName: "arrow.right.square")
                            Text("Log Out")
                        }
                        .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Settings")
            .alert("Log Out", isPresented: $showingLogoutAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Log Out", role: .destructive) {
                    authManager.logout()
                }
            } message: {
                Text("Are you sure you want to log out?")
            }
            .onAppear {
                checkBackendConnection()
            }
        }
    }

    private var statusIcon: String {
        switch backendStatus {
        case .unknown: return "questionmark.circle"
        case .checking: return "arrow.clockwise"
        case .connected: return "checkmark.circle.fill"
        case .disconnected: return "xmark.circle.fill"
        }
    }

    private var statusColor: Color {
        switch backendStatus {
        case .unknown: return .secondary
        case .checking: return .blue
        case .connected: return .green
        case .disconnected: return .red
        }
    }

    private var statusText: String {
        switch backendStatus {
        case .unknown: return "Unknown"
        case .checking: return "Checking..."
        case .connected: return "Connected"
        case .disconnected: return "Disconnected"
        }
    }

    private func checkBackendConnection() {
        backendStatus = .checking

        Task {
            let isConnected = await appManager.checkBackendHealth()
            backendStatus = isConnected ? .connected : .disconnected
        }
    }
}

// MARK: - Setting Row
struct SettingRow: View {
    let icon: String
    let title: String
    let value: String

    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .frame(width: 24)

            Text(title)

            Spacer()

            Text(value)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Language Settings View
struct LanguageSettingsView: View {
    @Binding var profile: UserProfile?

    var body: some View {
        List {
            ForEach(Language.commonLanguages, id: \.code) { language in
                Button {
                    profile?.targetLanguage = language.name
                    UserDefaultsHelper.shared.saveUserProfile(profile!)
                } label: {
                    HStack {
                        Text(language.flag)
                        Text(language.name)
                        Spacer()
                        if profile?.targetLanguage == language.name {
                            Image(systemName: "checkmark")
                                .foregroundColor(.blue)
                        }
                    }
                }
                .foregroundColor(.primary)
            }
        }
        .navigationTitle("Target Language")
    }
}

// MARK: - Proficiency Settings View
struct ProficiencySettingsView: View {
    @Binding var profile: UserProfile?

    var body: some View {
        List {
            ForEach(UserProfile.ProficiencyLevel.allCases, id: \.self) { level in
                Button {
                    profile?.proficiencyLevel = level
                    UserDefaultsHelper.shared.saveUserProfile(profile!)
                } label: {
                    HStack {
                        Text(level.displayName)
                        Spacer()
                        if profile?.proficiencyLevel == level {
                            Image(systemName: "checkmark")
                                .foregroundColor(.blue)
                        }
                    }
                }
                .foregroundColor(.primary)
            }
        }
        .navigationTitle("Proficiency Level")
    }
}

// MARK: - Interests Settings View
struct InterestsSettingsView: View {
    @Binding var profile: UserProfile?

    let availableInterests = [
        "Travel", "Food & Cooking", "Sports", "Technology",
        "Music", "Movies & TV", "Books & Literature", "Business",
        "Science", "History", "Art", "Fashion",
        "Health & Fitness", "Gaming", "Nature", "Politics"
    ]

    var body: some View {
        List {
            ForEach(availableInterests, id: \.self) { interest in
                Button {
                    toggleInterest(interest)
                } label: {
                    HStack {
                        Text(interest)
                        Spacer()
                        if profile?.interests.contains(interest) == true {
                            Image(systemName: "checkmark")
                                .foregroundColor(.blue)
                        }
                    }
                }
                .foregroundColor(.primary)
            }
        }
        .navigationTitle("Interests")
    }

    private func toggleInterest(_ interest: String) {
        guard var currentProfile = profile else { return }

        if let index = currentProfile.interests.firstIndex(of: interest) {
            currentProfile.interests.remove(at: index)
        } else {
            currentProfile.interests.append(interest)
        }

        profile = currentProfile
        UserDefaultsHelper.shared.saveUserProfile(currentProfile)
    }
}

#Preview {
    SettingsView()
}
