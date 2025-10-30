import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ErrorBoundary from './src/components/ErrorBoundary';

// Import screens
import NewAuthScreen from './src/screens/NewAuthScreen';
import HomeScreen from './src/screens/HomeScreen-Simple';

// Import providers
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

const Stack = createStackNavigator();

/**
 * Simple, clean navigation based on auth state
 */
function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const [initTimeout, setInitTimeout] = useState(false);

  // Prevent infinite loading on web
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('⏰ Init timeout - forcing render');
      setInitTimeout(true);
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);

  // Show loading for max 3 seconds
  if (!initTimeout && isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>SpeakEasy</Text>
        <Text style={styles.loadingSubtext}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={NewAuthScreen} />
        ) : (
          <Stack.Screen name="Home" component={HomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/**
 * Root App Component
 */
export default function App() {
  console.log('🚀 App component rendering');
  console.log('📱 Platform:', Platform.OS);

  return (
    <ErrorBoundary>
      <AuthProvider>
        {Platform.OS === 'ios' && <StatusBar barStyle="dark-content" />}
        {Platform.OS === 'ios' ? (
          <SafeAreaView style={styles.container}>
            <AppNavigator />
          </SafeAreaView>
        ) : (
          <View style={styles.container}>
            <AppNavigator />
          </View>
        )}
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
  },
});
