//
//  OnboardingView.swift
//  SpeakEasy
//
//  Onboarding flow for setting up user profile
//

import SwiftUI

struct OnboardingView: View {
    @StateObject private var appManager = AppManager.shared
    @State private var currentStep = 0
    @State private var profile = UserProfile.default

    let totalSteps = 4

    var body: some View {
        VStack(spacing: 0) {
            // Progress Bar
            ProgressView(value: Double(currentStep), total: Double(totalSteps))
                .padding()

            // Content
            TabView(selection: $currentStep) {
                WelcomeStep()
                    .tag(0)

                LanguageSelectionStep(profile: $profile)
                    .tag(1)

                ProficiencyLevelStep(profile: $profile)
                    .tag(2)

                InterestsStep(profile: $profile)
                    .tag(3)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(.easeInOut, value: currentStep)

            // Navigation Buttons
            HStack(spacing: 16) {
                if currentStep > 0 {
                    Button(action: previousStep) {
                        Text("Back")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                }

                Button(action: nextStep) {
                    Text(currentStep == totalSteps - 1 ? "Get Started" : "Continue")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
            }
            .padding()
        }
    }

    private func nextStep() {
        if currentStep < totalSteps - 1 {
            currentStep += 1
        } else {
            completeOnboarding()
        }
    }

    private func previousStep() {
        if currentStep > 0 {
            currentStep -= 1
        }
    }

    private func completeOnboarding() {
        appManager.updateUserProfile(profile)
        appManager.completeOnboarding()
    }
}

// MARK: - Welcome Step
struct WelcomeStep: View {
    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "message.fill")
                .font(.system(size: 80))
                .foregroundColor(.blue)

            VStack(spacing: 12) {
                Text("Welcome to SpeakEasy")
                    .font(.largeTitle)
                    .fontWeight(.bold)

                Text("Learn languages through AI-powered personalized stories and conversations")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }

            Spacer()
        }
    }
}

// MARK: - Language Selection Step
struct LanguageSelectionStep: View {
    @Binding var profile: UserProfile

    var body: some View {
        VStack(spacing: 24) {
            VStack(spacing: 8) {
                Text("Which language do you want to learn?")
                    .font(.title2)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)

                Text("Choose your target language")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding()

            ScrollView {
                VStack(spacing: 12) {
                    ForEach(Language.commonLanguages, id: \.code) { language in
                        LanguageCard(
                            language: language,
                            isSelected: profile.targetLanguage == language.name
                        ) {
                            profile.targetLanguage = language.name
                        }
                    }
                }
                .padding()
            }
        }
    }
}

struct LanguageCard: View {
    let language: Language
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack {
                Text(language.flag)
                    .font(.largeTitle)

                VStack(alignment: .leading) {
                    Text(language.name)
                        .font(.headline)
                    Text(language.nativeName)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.blue)
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? Color.blue.opacity(0.1) : Color(.systemGray6))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.blue : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Proficiency Level Step
struct ProficiencyLevelStep: View {
    @Binding var profile: UserProfile

    var body: some View {
        VStack(spacing: 24) {
            VStack(spacing: 8) {
                Text("What's your current level?")
                    .font(.title2)
                    .fontWeight(.bold)

                Text("Select your proficiency level in \(profile.targetLanguage)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding()

            ScrollView {
                VStack(spacing: 12) {
                    ForEach(UserProfile.ProficiencyLevel.allCases, id: \.self) { level in
                        ProficiencyCard(
                            level: level,
                            isSelected: profile.proficiencyLevel == level
                        ) {
                            profile.proficiencyLevel = level
                        }
                    }
                }
                .padding()
            }
        }
    }
}

struct ProficiencyCard: View {
    let level: UserProfile.ProficiencyLevel
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(level.displayName)
                        .font(.headline)
                    Text(levelDescription)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.blue)
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? Color.blue.opacity(0.1) : Color(.systemGray6))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.blue : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }

    private var levelDescription: String {
        switch level {
        case .beginner:
            return "Just starting out"
        case .elementary:
            return "Can handle basic conversations"
        case .intermediate:
            return "Can communicate in most situations"
        case .upperIntermediate:
            return "Confident in most contexts"
        case .advanced:
            return "Near-native fluency"
        }
    }
}

// MARK: - Interests Step
struct InterestsStep: View {
    @Binding var profile: UserProfile

    let availableInterests = [
        "Travel", "Food & Cooking", "Sports", "Technology",
        "Music", "Movies & TV", "Books & Literature", "Business",
        "Science", "History", "Art", "Fashion",
        "Health & Fitness", "Gaming", "Nature", "Politics"
    ]

    var body: some View {
        VStack(spacing: 24) {
            VStack(spacing: 8) {
                Text("What are your interests?")
                    .font(.title2)
                    .fontWeight(.bold)

                Text("Select topics you'd like to learn about")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding()

            ScrollView {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 12) {
                    ForEach(availableInterests, id: \.self) { interest in
                        InterestChip(
                            interest: interest,
                            isSelected: profile.interests.contains(interest)
                        ) {
                            toggleInterest(interest)
                        }
                    }
                }
                .padding()
            }
        }
    }

    private func toggleInterest(_ interest: String) {
        if let index = profile.interests.firstIndex(of: interest) {
            profile.interests.remove(at: index)
        } else {
            profile.interests.append(interest)
        }
    }
}

struct InterestChip: View {
    let interest: String
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            Text(interest)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .frame(maxWidth: .infinity)
                .background(
                    RoundedRectangle(cornerRadius: 20)
                        .fill(isSelected ? Color.blue : Color(.systemGray6))
                )
                .foregroundColor(isSelected ? .white : .primary)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    OnboardingView()
}
