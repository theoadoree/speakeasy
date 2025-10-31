import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import StorageService from '../utils/storage';

// Conditional import for mobile Picker (not used on web)
let Picker;
if (Platform.OS !== 'web') {
  try {
    Picker = require('@react-native-picker/picker').Picker;
  } catch (e) {
    console.warn('Picker not available:', e);
  }
}

// OpenAI GPT-4 supports these languages well for learning
// Based on OpenAI's language model capabilities
const OPENAI_SUPPORTED_LANGUAGES = [
  'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Korean', 'Mandarin Chinese', 'Arabic', 'Russian',
  'Hindi', 'Dutch', 'Swedish', 'Norwegian', 'Danish',
  'Polish', 'Turkish', 'Greek', 'Hebrew', 'Vietnamese',
  'Thai', 'Indonesian', 'Filipino', 'Swahili', 'Bengali'
];

const NATIVE_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Korean', 'Mandarin Chinese', 'Arabic', 'Russian', 'Hindi',
  'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Polish', 'Turkish',
  'Greek', 'Hebrew', 'Vietnamese', 'Thai', 'Indonesian', 'Filipino',
  'Bengali', 'Urdu', 'Farsi', 'Swahili'
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
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [level, setLevel] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [saving, setSaving] = useState(false);

  // Filter available learning languages based on:
  // 1. OpenAI support
  // 2. Exclude native language
  const availableLearningLanguages = useMemo(() => {
    return OPENAI_SUPPORTED_LANGUAGES.filter(lang =>
      lang !== nativeLanguage && lang !== 'Other'
    );
  }, [nativeLanguage]);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const profile = {
        name,
        targetLanguage,
        nativeLanguage,
        level: 'unknown', // Will be determined after first conversation
        assessmentPending: true, // Flag to trigger assessment
        interests: selectedInterests,
        createdAt: new Date().toISOString()
      };

      console.log('Saving profile:', profile);
      await setUserProfile(profile);
      await StorageService.setOnboardingComplete(true);

      // Small delay to ensure everything is saved
      setTimeout(() => {
        navigation.replace('Main');
      }, 100);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(
        'Error',
        'Failed to save profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return name.trim().length > 0;
      case 2:
        return nativeLanguage.length > 0;
      case 3:
        return targetLanguage.length > 0;
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

        {/* Step 2: Native Language */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What's your native language? 🌍</Text>
            <Text style={styles.subtitle}>This helps us tailor lessons to you</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.pickerContainer}>
                <select
                  value={nativeLanguage}
                  onChange={(e) => setNativeLanguage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 15,
                    fontSize: 16,
                    border: 'none',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select your native language...</option>
                  {NATIVE_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </View>
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={nativeLanguage}
                  onValueChange={(itemValue) => setNativeLanguage(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select your native language..." value="" />
                  {NATIVE_LANGUAGES.map((lang) => (
                    <Picker.Item key={lang} label={lang} value={lang} />
                  ))}
                </Picker>
              </View>
            )}
          </View>
        )}

        {/* Step 3: Target Language (filtered by OpenAI availability) */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Which language do you want to learn? 📚</Text>
            <Text style={styles.subtitle}>
              Powered by OpenAI • {availableLearningLanguages.length} languages available
            </Text>
            {Platform.OS === 'web' ? (
              <View style={styles.pickerContainer}>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  disabled={availableLearningLanguages.length === 0}
                  style={{
                    width: '100%',
                    padding: 15,
                    fontSize: 16,
                    border: 'none',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select language to learn...</option>
                  {availableLearningLanguages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </View>
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={targetLanguage}
                  onValueChange={(itemValue) => setTargetLanguage(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  enabled={availableLearningLanguages.length > 0}
                >
                  <Picker.Item label="Select language to learn..." value="" />
                  {availableLearningLanguages.map((lang) => (
                    <Picker.Item key={lang} label={lang} value={lang} />
                  ))}
                </Picker>
              </View>
            )}
            {availableLearningLanguages.length === 0 && (
              <Text style={styles.warningText}>
                ⚠️ Please select a different native language to see available learning languages
              </Text>
            )}
          </View>
        )}

        {/* Step 4: Interests */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>What are you interested in? 🎯</Text>
            <Text style={styles.subtitle}>Select at least 3 topics you'd like to learn about</Text>
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
          style={[styles.continueButton, (!canContinue() || saving) && styles.continueButtonDisabled]}
          onPress={() => {
            if (step < 4) {
              setStep(step + 1);
            } else {
              handleComplete();
            }
          }}
          disabled={!canContinue() || saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.continueButtonText}>
              {step === 4 ? 'Start Learning! 🎉' : 'Continue'}
            </Text>
          )}
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    overflow: 'hidden',
    marginBottom: 20
  },
  picker: {
    height: Platform.OS === 'ios' ? 200 : 50,
    width: '100%'
  },
  pickerItem: {
    fontSize: 16,
    height: Platform.OS === 'ios' ? 200 : 50
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
  },
  warningText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFE5E5',
    borderRadius: 8
  }
});
