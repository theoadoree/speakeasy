//
//  AnimatedTeacherView.swift
//  SpeakEasy
//
//  Animated teacher avatar with mouth movement during speech
//

import SwiftUI
import AVFoundation

struct AnimatedTeacherView: View {
    @State private var isSpeaking = false
    @State private var mouthState: MouthState = .closed
    @State private var synthesizer = AVSpeechSynthesizer()
    @Binding var autoSpeakEnabled: Bool

    enum MouthState {
        case closed
        case slightlyOpen
        case mediumOpen
        case wideOpen

        var height: CGFloat {
            switch self {
            case .closed: return 3
            case .slightlyOpen: return 8
            case .mediumOpen: return 15
            case .wideOpen: return 20
            }
        }

        var width: CGFloat {
            switch self {
            case .closed: return 25
            case .slightlyOpen: return 28
            case .mediumOpen: return 32
            case .wideOpen: return 38
            }
        }
    }

    var body: some View {
        VStack(spacing: 12) {
            ZStack {
                // Face circle
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color(red: 0.96, green: 0.84, blue: 0.66), Color(red: 0.88, green: 0.72, blue: 0.56)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 100, height: 100)
                    .overlay(
                        Circle()
                            .stroke(Color.white, lineWidth: 3)
                    )
                    .shadow(color: .black.opacity(0.15), radius: 8, x: 0, y: 4)
                    .scaleEffect(isSpeaking ? 1.05 : 1.0)
                    .animation(.easeInOut(duration: 0.3), value: isSpeaking)

                // Speaking glow effect
                if isSpeaking {
                    Circle()
                        .stroke(Color.blue.opacity(0.4), lineWidth: 6)
                        .frame(width: 110, height: 110)
                        .blur(radius: 8)
                        .animation(.easeInOut(duration: 0.5).repeatForever(autoreverses: true), value: isSpeaking)
                }

                VStack(spacing: 10) {
                    // Eyes
                    HStack(spacing: 30) {
                        Circle()
                            .fill(Color.black.opacity(0.8))
                            .frame(width: 12, height: 12)

                        Circle()
                            .fill(Color.black.opacity(0.8))
                            .frame(width: 12, height: 12)
                    }
                    .offset(y: -5)

                    // Animated Mouth
                    Capsule()
                        .fill(Color.clear)
                        .overlay(
                            Capsule()
                                .stroke(Color.black.opacity(0.8), lineWidth: 2)
                        )
                        .frame(width: mouthState.width, height: mouthState.height)
                        .offset(y: 10)
                        .animation(.easeInOut(duration: 0.15), value: mouthState)
                }
            }

            // Auto Speak Toggle
            Toggle(isOn: $autoSpeakEnabled) {
                HStack(spacing: 6) {
                    Image(systemName: autoSpeakEnabled ? "speaker.wave.3.fill" : "speaker.slash.fill")
                        .foregroundColor(autoSpeakEnabled ? .blue : .gray)
                    Text("Auto Speak")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }
            .toggleStyle(.switch)
            .padding(.horizontal, 20)
        }
    }

    // MARK: - Public Methods

    func speak(_ text: String, language: String = "es-ES") {
        guard autoSpeakEnabled else { return }

        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: language)
        utterance.rate = 0.45 // Slightly slower for learning
        utterance.pitchMultiplier = 1.1
        utterance.volume = 1.0

        startMouthAnimation()

        synthesizer.speak(utterance)

        // Stop animation when done
        DispatchQueue.main.asyncAfter(deadline: .now() + Double(text.count) * 0.05 + 1.0) {
            stopMouthAnimation()
        }
    }

    func stopSpeaking() {
        synthesizer.stopSpeaking(at: .immediate)
        stopMouthAnimation()
    }

    // MARK: - Private Methods

    private func startMouthAnimation() {
        isSpeaking = true
        animateMouth()
    }

    private func stopMouthAnimation() {
        isSpeaking = false
        mouthState = .closed
    }

    private func animateMouth() {
        guard isSpeaking else { return }

        let states: [MouthState] = [.wideOpen, .mediumOpen, .slightlyOpen, .mediumOpen]
        let randomState = states.randomElement() ?? .mediumOpen

        withAnimation {
            mouthState = randomState
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
            animateMouth()
        }
    }
}

// MARK: - Preview
#Preview {
    VStack {
        AnimatedTeacherView(autoSpeakEnabled: .constant(true))
            .padding()

        Button("Test Speech") {
            // Preview test button
        }
        .buttonStyle(.borderedProminent)
    }
}
