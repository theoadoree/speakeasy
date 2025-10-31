//
//  UserDefaultsHelper.swift
//  SpeakEasy
//
//  Helper for persistent storage using UserDefaults
//

import Foundation

class UserDefaultsHelper {
    static let shared = UserDefaultsHelper()
    private let defaults = UserDefaults.standard

    private enum Keys {
        static let userProfile = "userProfile"
        static let onboardingComplete = "onboardingComplete"
        static let stories = "stories"
        static let conversations = "conversations"
    }

    private init() {}

    // MARK: - User Profile
    func saveUserProfile(_ profile: UserProfile) {
        if let encoded = try? JSONEncoder().encode(profile) {
            defaults.set(encoded, forKey: Keys.userProfile)
        }
    }

    func getUserProfile() -> UserProfile? {
        guard let data = defaults.data(forKey: Keys.userProfile),
              let profile = try? JSONDecoder().decode(UserProfile.self, from: data) else {
            return nil
        }
        return profile
    }

    func deleteUserProfile() {
        defaults.removeObject(forKey: Keys.userProfile)
    }

    // MARK: - Onboarding
    func setOnboardingComplete(_ complete: Bool) {
        defaults.set(complete, forKey: Keys.onboardingComplete)
    }

    func isOnboardingComplete() -> Bool {
        return defaults.bool(forKey: Keys.onboardingComplete)
    }

    // MARK: - Stories
    func saveStories(_ stories: [Story]) {
        if let encoded = try? JSONEncoder().encode(stories) {
            defaults.set(encoded, forKey: Keys.stories)
        }
    }

    func getStories() -> [Story] {
        guard let data = defaults.data(forKey: Keys.stories),
              let stories = try? JSONDecoder().decode([Story].self, from: data) else {
            return []
        }
        return stories
    }

    func addStory(_ story: Story) {
        var stories = getStories()
        stories.insert(story, at: 0)
        saveStories(stories)
    }

    func deleteStory(_ storyId: String) {
        var stories = getStories()
        stories.removeAll { $0.id == storyId }
        saveStories(stories)
    }

    // MARK: - Conversations
    func saveConversations(_ conversations: [Conversation]) {
        if let encoded = try? JSONEncoder().encode(conversations) {
            defaults.set(encoded, forKey: Keys.conversations)
        }
    }

    func getConversations() -> [Conversation] {
        guard let data = defaults.data(forKey: Keys.conversations),
              let conversations = try? JSONDecoder().decode([Conversation].self, from: data) else {
            return []
        }
        return conversations
    }

    func updateConversation(_ conversation: Conversation) {
        var conversations = getConversations()
        if let index = conversations.firstIndex(where: { $0.id == conversation.id }) {
            conversations[index] = conversation
        } else {
            conversations.insert(conversation, at: 0)
        }
        saveConversations(conversations)
    }

    // MARK: - Clear All Data
    func clearAllData() {
        defaults.removeObject(forKey: Keys.userProfile)
        defaults.removeObject(forKey: Keys.onboardingComplete)
        defaults.removeObject(forKey: Keys.stories)
        defaults.removeObject(forKey: Keys.conversations)
    }
}
