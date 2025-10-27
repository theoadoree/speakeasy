import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { AppProvider, useApp } from './src/contexts/AppContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import StorageService from './src/utils/storage';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import VerifyEmailScreen from './src/screens/VerifyEmailScreen';
import HomeScreen from './src/screens/HomeScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ReaderScreen from './src/screens/ReaderScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator({ navigation }) {
  const AccountIcon = () => (
    <Text onPress={() => navigation.navigate('Settings')} style={{ fontSize: 20 }}>👤</Text>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <AccountIcon />,
        headerTitle: '',
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: styles.tabBarLabel
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📚</Text>,
          tabBarLabel: 'Learn'
        }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💬</Text>,
          tabBarLabel: 'Practice'
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>⚙️</Text>,
          tabBarLabel: 'Settings'
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isLoading: appLoading } = useApp();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      checkOnboarding();
    }
  }, [isAuthenticated]);

  const checkOnboarding = async () => {
    const complete = await StorageService.isOnboardingComplete();
    setOnboardingComplete(complete);
  };

  // Show loading screen while checking auth and app state
  if (authLoading || appLoading || (isAuthenticated && onboardingComplete === null)) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>SpeakEasy 🚀</Text>
        <Text style={styles.loadingSubtext}>Your AI Language Tutor</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        {!isAuthenticated ? (
          // Authentication Flow
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          </>
        ) : !onboardingComplete ? (
          // Onboarding Flow
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          // Main App Flow
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="Reader"
              component={ReaderScreen}
              options={{
                headerShown: true,
                headerTitle: '',
                headerBackTitle: 'Back',
                headerTintColor: '#007AFF'
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8
  },
  tabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600'
  }
});
