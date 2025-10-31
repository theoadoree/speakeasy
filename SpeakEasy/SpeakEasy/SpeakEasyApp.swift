//
//  SpeakEasyApp.swift
//  SpeakEasy
//
//  Main app entry point with authentication and navigation
//

import SwiftUI

@main
struct SpeakEasyApp: App {
    @StateObject private var authManager = AuthenticationManager.shared
    @StateObject private var appManager = AppManager.shared

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(authManager)
                .environmentObject(appManager)
        }
    }
}

// MARK: - Root View with Conditional Navigation
struct RootView: View {
    @EnvironmentObject var authManager: AuthenticationManager
    @EnvironmentObject var appManager: AppManager

    var body: some View {
        Group {
            if authManager.isLoading {
                LoadingView()
            } else if authManager.isAuthenticated {
                if appManager.isOnboardingComplete() {
                    MainTabView()
                } else {
                    OnboardingView()
                }
            } else {
                LoginView()
            }
        }
    }
}

// MARK: - Main Tab View
struct MainTabView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem {
                    Label("Learn", systemImage: "book.fill")
                }

            PracticeView()
                .tabItem {
                    Label("Practice", systemImage: "bubble.left.and.bubble.right.fill")
                }

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
        }
    }
}

// MARK: - Loading View
struct LoadingView: View {
    var body: some View {
        ZStack {
            Color(.systemBackground)
                .ignoresSafeArea()

            VStack(spacing: 20) {
                Image(systemName: "message.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.blue)

                ProgressView()
                    .scaleEffect(1.5)

                Text("Loading...")
                    .foregroundColor(.secondary)
            }
        }
    }
}
