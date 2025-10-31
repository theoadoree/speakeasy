//
//  HomeView.swift
//  SpeakEasy
//
//  Home screen with story generation and content library
//

import SwiftUI

struct HomeView: View {
    @StateObject private var appManager = AppManager.shared
    @State private var showingReader = false
    @State private var selectedStory: Story?

    var body: some View {
        NavigationView {
            ZStack {
                Color(.systemBackground)
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        // Welcome Header
                        if let profile = appManager.userProfile {
                            WelcomeHeader(targetLanguage: profile.targetLanguage)
                        }

                        // Generate Story Button
                        GenerateStoryButton(isLoading: appManager.isLoading) {
                            Task {
                                await appManager.generateStory()
                            }
                        }

                        // Error Message
                        if let errorMessage = appManager.errorMessage {
                            ErrorBanner(message: errorMessage)
                        }

                        // Story Library
                        if !appManager.stories.isEmpty {
                            StoryLibrary(
                                stories: appManager.stories,
                                onStoryTap: { story in
                                    selectedStory = story
                                    showingReader = true
                                },
                                onStoryDelete: { story in
                                    appManager.deleteStory(story)
                                }
                            )
                        } else {
                            EmptyStateView()
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Learn")
            .sheet(item: $selectedStory) { story in
                ReaderView(story: story)
            }
        }
    }
}

// MARK: - Welcome Header
struct WelcomeHeader: View {
    let targetLanguage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Ready to practice?")
                .font(.title)
                .fontWeight(.bold)

            Text("Generate personalized stories in \(targetLanguage)")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// MARK: - Generate Story Button
struct GenerateStoryButton: View {
    let isLoading: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: "sparkles")
                    .font(.title3)

                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    Text("Generate New Story")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(
                LinearGradient(
                    colors: [.blue, .purple],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .foregroundColor(.white)
            .cornerRadius(12)
        }
        .disabled(isLoading)
    }
}

// MARK: - Error Banner
struct ErrorBanner: View {
    let message: String

    var body: some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundColor(.red)

            Text(message)
                .font(.subheadline)
                .foregroundColor(.red)

            Spacer()
        }
        .padding()
        .background(Color.red.opacity(0.1))
        .cornerRadius(8)
    }
}

// MARK: - Story Library
struct StoryLibrary: View {
    let stories: [Story]
    let onStoryTap: (Story) -> Void
    let onStoryDelete: (Story) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Your Stories")
                .font(.title2)
                .fontWeight(.bold)

            LazyVStack(spacing: 12) {
                ForEach(stories) { story in
                    StoryCard(story: story) {
                        onStoryTap(story)
                    } onDelete: {
                        onStoryDelete(story)
                    }
                }
            }
        }
    }
}

// MARK: - Story Card
struct StoryCard: View {
    let story: Story
    let onTap: () -> Void
    let onDelete: () -> Void

    @State private var showingDeleteAlert = false

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                // Title and Language
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(story.title)
                            .font(.headline)
                            .foregroundColor(.primary)
                            .lineLimit(2)

                        HStack(spacing: 8) {
                            Label(story.language, systemImage: "globe")
                            Label("\(story.estimatedReadTime) min", systemImage: "clock")
                        }
                        .font(.caption)
                        .foregroundColor(.secondary)
                    }

                    Spacer()

                    Menu {
                        Button(role: .destructive, action: { showingDeleteAlert = true }) {
                            Label("Delete", systemImage: "trash")
                        }
                    } label: {
                        Image(systemName: "ellipsis")
                            .foregroundColor(.secondary)
                            .padding(8)
                    }
                }

                // Topics
                if !story.topics.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(story.topics, id: \.self) { topic in
                                Text(topic)
                                    .font(.caption)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(Color.blue.opacity(0.1))
                                    .foregroundColor(.blue)
                                    .cornerRadius(12)
                            }
                        }
                    }
                }

                // Difficulty and Date
                HStack {
                    Text(story.difficultyLevel.capitalized)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.green.opacity(0.2))
                        .foregroundColor(.green)
                        .cornerRadius(6)

                    Spacer()

                    Text(story.createdAt, style: .date)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
        .buttonStyle(.plain)
        .alert("Delete Story", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive, action: onDelete)
        } message: {
            Text("Are you sure you want to delete '\(story.title)'?")
        }
    }
}

// MARK: - Empty State
struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "book.closed")
                .font(.system(size: 60))
                .foregroundColor(.secondary)

            VStack(spacing: 8) {
                Text("No Stories Yet")
                    .font(.title3)
                    .fontWeight(.semibold)

                Text("Generate your first personalized story to start learning")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding(.vertical, 40)
    }
}

#Preview {
    HomeView()
}
