import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function VerifyEmailScreen({ route, navigation }) {
  const { email: initialEmail } = route.params || {};
  const { verifyEmail, resendVerification, authError, clearError } = useAuth();
  const [email, setEmail] = useState(initialEmail || '');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = async () => {
    clearError();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email');
      return;
    }
    if (!code || code.length < 4) {
      Alert.alert('Invalid Code', 'Please enter the verification code');
      return;
    }
    setIsSubmitting(true);
    const result = await verifyEmail(email, code.trim());
    setIsSubmitting(false);
    if (result.success) {
      navigation.replace('Onboarding');
    } else if (result.error) {
      Alert.alert('Verification Failed', result.error);
    }
  };

  const handleResend = async () => {
    clearError();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email');
      return;
    }
    const result = await resendVerification(email);
    if (result.success) {
      Alert.alert('Sent', 'We resent your verification code.');
    } else if (result.error) {
      Alert.alert('Failed', result.error);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>We sent a 6-digit code to your email address</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        {authError ? (
          <View style={styles.errorContainer}><Text style={styles.errorText}>{authError}</Text></View>
        ) : null}

        <TouchableOpacity style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={handleVerify} disabled={isSubmitting}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
          <Text style={styles.resendText}>Resend Code</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0', color: '#1A1A1A' },
  errorContainer: { backgroundColor: '#FFE5E5', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#D32F2F', fontSize: 14, textAlign: 'center' },
  button: { backgroundColor: '#007AFF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  resendButton: { alignItems: 'center', marginTop: 12 },
  resendText: { color: '#007AFF', fontSize: 14, fontWeight: '600' },
});
