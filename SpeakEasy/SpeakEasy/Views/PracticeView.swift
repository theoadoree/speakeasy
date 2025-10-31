//
//  PracticeView.swift
//  SpeakEasy
//
//  AI conversation practice screen
//

import SwiftUI

struct PracticeView: View {
    @StateObject private var appManager = AppManager.shared
    @State private var messageText = ""
    @FocusState private var isInputFocused: Bool

    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Messages List
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            if let conversation = appManager.currentConversation {
                                ForEach(conversation.messages) { message in
                                    MessageBubble(message: message)
                                        .id(message.id)
                                }
                            } else {
                                EmptyConversationView(
                                    onStart: {
                                        appManager.startNewConversation()
                                    }
                                )
                            }

                            if appManager.isLoading {
                                TypingIndicator()
                            }
                        }
                        .padding()
                    }
                    .onChange(of: appManager.currentConversation?.messages.count) {
                        if let lastMessage = appManager.currentConversation?.messages.last {
                            withAnimation {
                                proxy.scrollTo(lastMessage.id, anchor: .bottom)
                            }
                        }
                    }
                }

                Divider()

                // Input Area
                HStack(spacing: 12) {
                    TextField("Type your message...", text: $messageText, axis: .vertical)
                        .textFieldStyle(.plain)
                        .padding(12)
                        .background(Color(.systemGray6))
                        .cornerRadius(20)
                        .focused($isInputFocused)
                        .lineLimit(1...5)

                    Button(action: sendMessage) {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.title2)
                            .foregroundColor(messageText.isEmpty ? .gray : .blue)
                    }
                    .disabled(messageText.isEmpty || appManager.isLoading)
                }
                .padding()
            }
            .navigationTitle("Practice")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button {
                            appManager.startNewConversation()
                        } label: {
                            Label("New Conversation", systemImage: "plus.message")
                        }

                        Button {
                            // View past conversations
                        } label: {
                            Label("Past Conversations", systemImage: "clock")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
        }
        .onAppear {
            if appManager.currentConversation == nil {
                appManager.startNewConversation()
            }
        }
    }

    private func sendMessage() {
        let text = messageText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        messageText = ""
        isInputFocused = false

        Task {
            await appManager.sendMessage(text)
        }
    }
}

// MARK: - Message Bubble
struct MessageBubble: View {
    let message: Message

    var body: some View {
        HStack {
            if message.role == .user {
                Spacer()
            }

            VStack(alignment: message.role == .user ? .trailing : .leading, spacing: 4) {
                Text(message.content)
                    .padding(12)
                    .background(backgroundColor)
                    .foregroundColor(textColor)
                    .cornerRadius(16)

                Text(message.timestamp, style: .time)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            if message.role == .assistant {
                Spacer()
            }
        }
    }

    private var backgroundColor: Color {
        message.role == .user ? .blue : Color(.systemGray5)
    }

    private var textColor: Color {
        message.role == .user ? .white : .primary
    }
}

// MARK: - Typing Indicator
struct TypingIndicator: View {
    @State private var animationAmount = 0.0

    var body: some View {
        HStack {
            HStack(spacing: 4) {
                ForEach(0..<3) { index in
                    Circle()
                        .fill(Color.secondary)
                        .frame(width: 8, height: 8)
                        .opacity(animationAmount == Double(index) ? 0.3 : 1.0)
                }
            }
            .padding(12)
            .background(Color(.systemGray5))
            .cornerRadius(16)

            Spacer()
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 0.6).repeatForever()) {
                animationAmount = 2.0
            }
        }
    }
}

// MARK: - Empty Conversation View
struct EmptyConversationView: View {
    let onStart: () -> Void

    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "bubble.left.and.bubble.right")
                .font(.system(size: 60))
                .foregroundColor(.secondary)

            VStack(spacing: 8) {
                Text("Practice Conversation")
                    .font(.title2)
                    .fontWeight(.bold)

                Text("Chat with AI in your target language. Get real-time feedback and practice natural conversations.")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }

            Button(action: onStart) {
                Text("Start Conversation")
                    .fontWeight(.semibold)
                    .padding(.horizontal, 32)
                    .padding(.vertical, 12)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
        }
        .padding()
    }
}

#Preview {
    PracticeView()
}
