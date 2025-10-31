//
//  AppManager.swift
//  SpeakEasy
//
//  Manages app-wide state including user profile, stories, and conversations
//

import Foundation
import Combine

@MainActor
class AppManager: ObservableObject {
    static let shared = AppManager()

    @Published var userProfile: UserProfile?
    @Published var stories: [Story] = []
    @Published var currentConversation: Conversation?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let apiService = APIService.shared
    private let userDefaultsHelper = UserDefaultsHelper.shared

    private init() {
        loadUserData()
    }

    // MARK: - Data Loading
    func loadUserData() {
        userProfile = userDefaultsHelper.getUserProfile()
        stories = userDefaultsHelper.getStories()
    }

    // MARK: - User Profile
    func updateUserProfile(_ profile: UserProfile) {
        userProfile = profile
        userDefaultsHelper.saveUserProfile(profile)
    }

    func completeOnboarding() {
        userDefaultsHelper.setOnboardingComplete(true)
    }

    func isOnboardingComplete() -> Bool {
        return userDefaultsHelper.isOnboardingComplete()
    }

    // MARK: - Story Management
    func generateStory() async {
        guard let profile = userProfile else { return }

        isLoading = true
        errorMessage = nil

        do {
            let story = try await apiService.generateStory(profile: profile)
            stories.insert(story, at: 0)
            userDefaultsHelper.addStory(story)
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func deleteStory(_ story: Story) {
        stories.removeAll { $0.id == story.id }
        userDefaultsHelper.deleteStory(story.id)
    }

    // MARK: - Word Explanation
    func explainWord(word: String, context: String) async -> WordExplanation? {
        guard let profile = userProfile else { return nil }

        do {
            return try await apiService.explainWord(
                word: word,
                context: context,
                targetLanguage: profile.targetLanguage,
                nativeLanguage: profile.nativeLanguage
            )
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    // MARK: - Conversation Management
    func startNewConversation() {
        guard let profile = userProfile else { return }

        currentConversation = Conversation(
            id: UUID().uuidString,
            messages: [],
            language: profile.targetLanguage,
            startedAt: Date(),
            lastMessageAt: Date()
        )
    }

    func sendMessage(_ content: String) async {
        guard var conversation = currentConversation,
              let profile = userProfile else { return }

        // Add user message
        let userMessage = Message(
            id: UUID().uuidString,
            role: .user,
            content: content,
            timestamp: Date(),
            language: profile.targetLanguage
        )
        conversation.messages.append(userMessage)
        currentConversation = conversation

        isLoading = true

        do {
            let response = try await apiService.sendMessage(
                message: content,
                conversationHistory: conversation.messages,
                targetLanguage: profile.targetLanguage
            )
            conversation.messages.append(response)
            conversation.lastMessageAt = Date()
            currentConversation = conversation
            userDefaultsHelper.updateConversation(conversation)
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func loadConversations() -> [Conversation] {
        return userDefaultsHelper.getConversations()
    }

    // MARK: - Backend Health
    func checkBackendHealth() async -> Bool {
        do {
            return try await apiService.healthCheck()
        } catch {
            return false
        }
    }
}
