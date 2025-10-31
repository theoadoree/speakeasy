import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../contexts/AuthContext';
import AuthService from '../services/auth';

export default function SignUpScreen({ navigation }) {
  const { register, authError, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  useEffect(() => {
    checkAppleAuth();
  }, []);

  const checkAppleAuth = async () => {
    const available = await AuthService.isAppleSignInAvailable();
    setIsAppleAvailable(available || Platform.OS === 'web');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    clearError();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(email, password, name);

      if (!result.success) {
        Alert.alert('Sign Up Failed', result.error || 'Unable to create account');
      }
      // If successful, the AuthContext will update and navigate automatically
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    clearError();
    try {
      const result = await AuthService.signInWithApple();
      if (result.success) {
        // Force reload auth state
        window.location.reload?.() || navigation.navigate('Home');
      } else if (result.error !== 'User cancelled') {
        Alert.alert('Sign Up Failed', result.error || 'Apple Sign In failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    clearError();
    try {
      const result = await AuthService.signInWithGoogle();
      if (result.success) {
        // Force reload auth state
        window.location.reload?.() || navigation.navigate('Home');
      } else if (result.error !== 'User cancelled') {
        Alert.alert('Sign Up Failed', result.error || 'Google Sign In failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Join SpeakEasy 🚀</Text>
          <Text style={styles.subtitle}>
            Start your personalized language learning journey
          </Text>
        </View>

        <View style={styles.form}>
          {/* Social Sign In Options */}
          <View style={styles.socialContainer}>
            {isAppleAvailable && (
              <TouchableOpacity
                style={[styles.socialButton, styles.appleButton, isLoading && styles.buttonDisabled]}
                onPress={handleAppleSignIn}
                disabled={isLoading}
              >
                <Text style={styles.socialButtonText}>🍎 Continue with Apple</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton, isLoading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Text style={[styles.socialButtonText, styles.googleButtonText]}>G Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="John Doe"
              placeholderTextColor="#999"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) {
                  setErrors({ ...errors, name: null });
                }
              }}
              autoCapitalize="words"
              autoComplete="name"
              editable={!isLoading}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="your.email@example.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors({ ...errors, email: null });
                }
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!isLoading}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="At least 6 characters"
              placeholderTextColor="#999"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors({ ...errors, password: null });
                }
              }}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              editable={!isLoading}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              placeholder="Re-enter your password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: null });
                }
              }}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              editable={!isLoading}
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {authError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{authError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By signing up, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#1A1A1A',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorMessage: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  socialContainer: {
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    color: '#999',
    fontSize: 14,
    marginHorizontal: 16,
    fontWeight: '500',
  },
  socialButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  appleButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  googleButton: {
    backgroundColor: '#FFF',
    borderColor: '#E0E0E0',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  googleButtonText: {
    color: '#1A1A1A',
  },
});
