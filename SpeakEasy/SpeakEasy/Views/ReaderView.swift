//
//  ReaderView.swift
//  SpeakEasy
//
//  Interactive reading view with word explanations
//

import SwiftUI

struct ReaderView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var appManager = AppManager.shared

    let story: Story

    @State private var selectedWord: String?
    @State private var wordExplanation: WordExplanation?
    @State private var isLoadingExplanation = false
    @State private var showingExplanation = false

    var body: some View {
        NavigationView {
            ZStack {
                Color(.systemBackground)
                    .ignoresSafeArea()

                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        // Story Header
                        StoryHeader(story: story)

                        Divider()

                        // Story Content
                        SelectableTextView(
                            text: story.content,
                            onWordSelected: { word in
                                handleWordSelection(word)
                            }
                        )
                        .font(.body)
                        .lineSpacing(8)
                    }
                    .padding()
                }
            }
            .navigationTitle("Read")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                    }
                }
            }
            .sheet(isPresented: $showingExplanation) {
                if let explanation = wordExplanation {
                    WordExplanationSheet(explanation: explanation)
                }
            }
        }
    }

    private func handleWordSelection(_ word: String) {
        selectedWord = word
        isLoadingExplanation = true

        Task {
            if let explanation = await appManager.explainWord(
                word: word,
                context: story.content
            ) {
                wordExplanation = explanation
                showingExplanation = true
            }
            isLoadingExplanation = false
        }
    }
}

// MARK: - Story Header
struct StoryHeader: View {
    let story: Story

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(story.title)
                .font(.title)
                .fontWeight(.bold)

            HStack(spacing: 16) {
                Label(story.language, systemImage: "globe")
                Label(story.difficultyLevel.capitalized, systemImage: "chart.bar")
                Label("\(story.estimatedReadTime) min", systemImage: "clock")
            }
            .font(.subheadline)
            .foregroundColor(.secondary)

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
        }
    }
}

// MARK: - Selectable Text View
struct SelectableTextView: View {
    let text: String
    let onWordSelected: (String) -> Void

    var body: some View {
        let paragraphs = text.components(separatedBy: "\n\n")

        VStack(alignment: .leading, spacing: 16) {
            ForEach(Array(paragraphs.enumerated()), id: \.offset) { _, paragraph in
                FlowLayout(spacing: 4) {
                    ForEach(Array(paragraph.components(separatedBy: .whitespacesAndNewlines).enumerated()), id: \.offset) { _, word in
                        if !word.isEmpty {
                            Button {
                                let cleanWord = word.trimmingCharacters(in: .punctuationCharacters)
                                onWordSelected(cleanWord)
                            } label: {
                                Text(word + " ")
                                    .foregroundColor(.primary)
                            }
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Flow Layout (for wrapping text)
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(
            in: proposal.replacingUnspecifiedDimensions().width,
            subviews: subviews,
            spacing: spacing
        )
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(
            in: bounds.width,
            subviews: subviews,
            spacing: spacing
        )
        for (index, subview) in subviews.enumerated() {
            subview.place(at: CGPoint(x: bounds.minX + result.positions[index].x, y: bounds.minY + result.positions[index].y), proposal: .unspecified)
        }
    }

    struct FlowResult {
        var size: CGSize = .zero
        var positions: [CGPoint] = []

        init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var x: CGFloat = 0
            var y: CGFloat = 0
            var lineHeight: CGFloat = 0

            for subview in subviews {
                let size = subview.sizeThatFits(.unspecified)

                if x + size.width > maxWidth, x > 0 {
                    x = 0
                    y += lineHeight + spacing
                    lineHeight = 0
                }

                positions.append(CGPoint(x: x, y: y))
                lineHeight = max(lineHeight, size.height)
                x += size.width + spacing
            }

            self.size = CGSize(width: maxWidth, height: y + lineHeight)
        }
    }
}

// MARK: - Word Explanation Sheet
struct WordExplanationSheet: View {
    @Environment(\.dismiss) private var dismiss
    let explanation: WordExplanation

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Word and Translation
                    VStack(alignment: .leading, spacing: 8) {
                        Text(explanation.word)
                            .font(.title)
                            .fontWeight(.bold)

                        if let pronunciation = explanation.pronunciation {
                            Text(pronunciation)
                                .font(.title3)
                                .foregroundColor(.secondary)
                        }

                        if let pos = explanation.partOfSpeech {
                            Text(pos)
                                .font(.subheadline)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color.blue.opacity(0.1))
                                .foregroundColor(.blue)
                                .cornerRadius(8)
                        }
                    }

                    Divider()

                    // Translation
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Translation")
                            .font(.headline)
                            .foregroundColor(.secondary)

                        Text(explanation.translation)
                            .font(.title3)
                    }

                    // Definition
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Definition")
                            .font(.headline)
                            .foregroundColor(.secondary)

                        Text(explanation.definition)
                            .font(.body)
                    }

                    // Example
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Example")
                            .font(.headline)
                            .foregroundColor(.secondary)

                        Text(explanation.exampleSentence)
                            .font(.body)
                            .italic()
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                    }
                }
                .padding()
            }
            .navigationTitle("Word Definition")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    ReaderView(story: Story(
        id: "1",
        title: "Sample Story",
        content: "This is a sample story content for preview purposes.",
        language: "Spanish",
        difficultyLevel: "intermediate",
        createdAt: Date(),
        topics: ["Travel", "Culture"],
        estimatedReadTime: 5
    ))
}
