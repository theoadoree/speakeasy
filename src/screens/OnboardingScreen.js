import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import StorageService from '../utils/storage';

const LANGUAGES_TO_LEARN = [
  'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Korean', 'Mandarin', 'Arabic', 'Russian',
  'Hindi', 'Dutch', 'Swedish', 'Polish', 'Turkish'
];

const NATIVE_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Korean', 'Mandarin', 'Arabic', 'Russian', 'Hindi',
  'Dutch', 'Swedish', 'Polish', 'Turkish', 'Other'
];

const LEVELS = [
  { code: 'A1', name: 'Beginner', desc: 'Just starting out' },
  { code: 'A2', name: 'Elementary', desc: 'Basic conversations' },
  { code: 'B1', name: 'Intermediate', desc: 'Everyday situations' },
  { code: 'B2', name: 'Upper Intermediate', desc: 'Complex topics' },
  { code: 'C1', name: 'Advanced', desc: 'Fluent expression' },
  { code: 'C2', name: 'Mastery', desc: 'Native-like proficiency' }
];

const INTERESTS = [
  '📚 Reading', '🎬 Movies', '🎵 Music', '🎮 Gaming',
  '🍳 Cooking', '✈️ Travel', '💼 Business', '⚽ Sports',
  '🎨 Art', '🔬 Science', '💻 Technology', '📰 News',
  '🏃 Fitness', '🌍 Culture', '📖 Literature', '🎭 Theater'
];

export default function OnboardingScreen({ navigation }) {
  const { setUserProfile } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('English');
  const [level, setLevel] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleComplete = async () => {
    const profile = {
      name,
      targetLanguage,
      nativeLanguage,
      level,
      interests: selectedInterests,
      createdAt: new Date().toISOString()
    };

    await setUserProfile(profile);
    await StorageService.setOnboardingComplete(true);
    navigation.replace('Main');
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return name.trim().length > 0;
      case 2:
        return targetLanguage.length > 0 && nativeLanguage.length > 0;
      case 3:
        return level.length > 0;
      case 4:
        return selectedInterests.length >= 3;
      default:
        return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo Header */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>SpeakEasy</Text>
          <Text style={styles.brandTagline}>AI-Powered Language Teacher</Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                s === step && styles.progressDotActive,
                s < step && styles.progressDotComplete
              ]}
            />
          ))}
        </View>

        {/* Step 1: Name */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Welcome! 👋</Text>
            <Text style={styles.subtitle}>What's your name?</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>
        )}

        {/* Step 2: Languages */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Which language do you want to learn?</Text>
            <ScrollView style={styles.scrollableOptions} contentContainerStyle={styles.optionsGrid}>
              {LANGUAGES_TO_LEARN.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.optionButton,
                    targetLanguage === lang && styles.optionButtonSelected
                  ]}
                  onPress={() => setTargetLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      targetLanguage === lang && styles.optionTextSelected
                    ]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.subtitle}>What's your native language?</Text>
            <ScrollView style={styles.scrollableOptions} contentContainerStyle={styles.optionsGrid}>
              {NATIVE_LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.optionButton,
                    nativeLanguage === lang && styles.optionButtonSelected
                  ]}
                  onPress={() => setNativeLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      nativeLanguage === lang && styles.optionTextSelected
                    ]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Step 3: Level */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What's your current level?</Text>
            {LEVELS.map((lvl) => (
              <TouchableOpacity
                key={lvl.code}
                style={[
                  styles.levelButton,
                  level === lvl.code && styles.levelButtonSelected
                ]}
                onPress={() => setLevel(lvl.code)}
              >
                <View style={styles.levelContent}>
                  <Text
                    style={[
                      styles.levelCode,
                      level === lvl.code && styles.levelCodeSelected
                    ]}
                  >
                    {lvl.code}
                  </Text>
                  <View style={styles.levelInfo}>
                    <Text
                      style={[
                        styles.levelName,
                        level === lvl.code && styles.levelNameSelected
                      ]}
                    >
                      {lvl.name}
                    </Text>
                    <Text
                      style={[
                        styles.levelDesc,
                        level === lvl.code && styles.levelDescSelected
                      ]}
                    >
                      {lvl.desc}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 4: Interests */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What are you interested in?</Text>
            <Text style={styles.subtitle}>Select at least 3</Text>
            <View style={styles.interestsGrid}>
              {INTERESTS.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.interestButton,
                    selectedInterests.includes(interest) && styles.interestButtonSelected
                  ]}
                  onPress={() => toggleInterest(interest)}
                >
                  <Text
                    style={[
                      styles.interestText,
                      selectedInterests.includes(interest) && styles.interestTextSelected
                    ]}
                  >
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.continueButton, !canContinue() && styles.continueButtonDisabled]}
          onPress={() => {
            if (step < 4) {
              setStep(step + 1);
            } else {
              handleComplete();
            }
          }}
          disabled={!canContinue()}
        >
          <Text style={styles.continueButtonText}>
            {step === 4 ? 'Get Started! 🎉' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    gap: 8
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0'
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
    width: 30
  },
  progressDotComplete: {
    backgroundColor: '#34C759'
  },
  stepContainer: {
    flex: 1
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 10
  },
  scrollableOptions: {
    maxHeight: 200,
    marginBottom: 20
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8'
  },
  optionButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF'
  },
  optionText: {
    fontSize: 16,
    color: '#666'
  },
  optionTextSelected: {
    color: '#FFF',
    fontWeight: '600'
  },
  levelButton: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 10,
    backgroundColor: '#F8F8F8'
  },
  levelButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD'
  },
  levelContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  levelCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 15,
    width: 50
  },
  levelCodeSelected: {
    color: '#007AFF'
  },
  levelInfo: {
    flex: 1
  },
  levelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4
  },
  levelNameSelected: {
    color: '#007AFF'
  },
  levelDesc: {
    fontSize: 14,
    color: '#666'
  },
  levelDescSelected: {
    color: '#007AFF'
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  interestButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8'
  },
  interestButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF'
  },
  interestText: {
    fontSize: 15,
    color: '#666'
  },
  interestTextSelected: {
    color: '#FFF',
    fontWeight: '600'
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center'
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  continueButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center'
  },
  continueButtonDisabled: {
    backgroundColor: '#CCC'
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF'
  }
});
