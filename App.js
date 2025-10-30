import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform, SafeAreaView, StatusBar } from 'react-native';
import { AppProvider, useApp } from './src/contexts/AppContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { SubscriptionProvider, useSubscription } from './src/contexts/SubscriptionContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import StorageService from './src/utils/storage';
import NotificationService from './src/services/notifications';

// Screens
import NewAuthScreen from './src/screens/NewAuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import LearnNavigatorScreen from './src/screens/LearnNavigatorScreen';
import PracticeNavigatorScreen from './src/screens/PracticeNavigatorScreen';
import LeaguesScreen from './src/screens/LeaguesScreen';
import MusicScreen from './src/screens/MusicScreen';
import MoreScreen from './src/screens/MoreScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import ReaderScreen from './src/screens/ReaderScreen';
import LyricsLessonScreen from './src/screens/LyricsLessonScreen';
import LessonDetailScreen from './src/screens/LessonDetailScreen';
import QuizScreen from './src/screens/QuizScreen';
import DebugStorageScreen from './src/screens/DebugStorageScreen';
import { Ionicons } from '@expo/vector-icons';
import ErrorBoundary from './src/components/ErrorBoundary';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: Platform.OS === 'ios' ? '#FFF' : '#FFF'
          },
        ],
        tabBarActiveTintColor: Platform.OS === 'ios' ? '#007AFF' : '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: [
          styles.tabBarLabel,
          {
            fontWeight: Platform.OS === 'ios' ? '700' : '600',
            fontSize: Platform.OS === 'ios' ? 11 : 10,
          },
        ],
      }}
    >
      <Tab.Screen
        name="Learn"
        component={LearnNavigatorScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: 'Learn'
        }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeNavigatorScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: 'Practice'
        }}
      />
      <Tab.Screen
        name="Music"
        component={MusicScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'musical-notes' : 'musical-notes-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: 'Music'
        }}
      />
      <Tab.Screen
        name="Leagues"
        component={LeaguesScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'trophy' : 'trophy-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: 'Leagues'
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'ellipsis-horizontal-circle' : 'ellipsis-horizontal-circle-outline'}
              size={24}
              color={color}
            />
          ),
          tabBarLabel: 'More'
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isLoading: appLoading } = useApp();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasActiveSubscription, loading: subscriptionLoading } = useSubscription();
  const [onboardingComplete, setOnboardingComplete] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      checkOnboarding();
      setupNotifications();
    }
  }, [isAuthenticated]);

  const checkOnboarding = async () => {
    const complete = await StorageService.isOnboardingComplete();
    setOnboardingComplete(complete);
  };

  const setupNotifications = async () => {
    try {
      // Request notification permissions
      const hasPermissions = await NotificationService.requestPermissions();

      if (hasPermissions) {
        // Check if reminders are enabled
        const prefs = await StorageService.getReminderPreferences();

        if (prefs.enabled) {
          // Schedule daily reminders
          await NotificationService.scheduleDailyReminders();
        }
      }

      // Set up notification listeners
      NotificationService.setupListeners(
        (notification) => {
          // Handle received notification while app is in foreground
          console.log('Notification received:', notification);
        },
        (response) => {
          // Handle notification tap
          console.log('Notification tapped:', response);
        }
      );

      // Track last login
      await StorageService.saveLastLogin();
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  // Show loading screen while checking auth and app state
  if (authLoading || appLoading || subscriptionLoading || (isAuthenticated && onboardingComplete === null)) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>SpeakEasy 🚀</Text>
        <Text style={styles.loadingSubtext}>Your AI Language Tutor</Text>
      </View>
    );
  }

  // Prepare navigation container
  const navigationContent = (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        {!isAuthenticated ? (
          // Authentication Flow (Force OAuth - no bypass)
          <Stack.Screen name="Auth" component={NewAuthScreen} />
        ) : !onboardingComplete ? (
          // Onboarding Flow
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !hasActiveSubscription() ? (
          // Subscription Flow (Force subscription - no bypass)
          <Stack.Screen
            name="Subscription"
            component={SubscriptionScreen}
            initialParams={{ fromOnboarding: true }}
          />
        ) : (
          // Main App Flow (Only accessible with active subscription)
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="Reader"
              component={ReaderScreen}
              options={{
                headerShown: true,
                headerTitle: '',
                headerBackTitle: 'Back',
                headerTintColor: Platform.OS === 'ios' ? '#007AFF' : '#007AFF'
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Settings',
                headerBackTitle: 'Back',
                headerTintColor: Platform.OS === 'ios' ? '#007AFF' : '#007AFF'
              }}
            />
            <Stack.Screen
              name="Review"
              component={ReviewScreen}
              options={{
                headerShown: true,
                headerTitle: 'Review',
                headerBackTitle: 'Back',
                headerTintColor: Platform.OS === 'ios' ? '#007AFF' : '#007AFF'
              }}
            />
            <Stack.Screen
              name="LyricsLesson"
              component={LyricsLessonScreen}
              options={{
                headerShown: false,
                presentation: 'card'
              }}
            />
            <Stack.Screen
              name="LessonDetail"
              component={LessonDetailScreen}
              options={{
                headerShown: false,
                presentation: 'card'
              }}
            />
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              options={{
                headerShown: false,
                presentation: 'modal'
              }}
            />
            <Stack.Screen
              name="DebugStorage"
              component={DebugStorageScreen}
              options={{
                headerShown: true,
                headerTitle: 'AsyncStorage Debug',
                headerBackTitle: 'Back',
                headerTintColor: Platform.OS === 'ios' ? '#007AFF' : '#007AFF'
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );

  return (
    <>
      {/* Show StatusBar only on iOS with dark content and white background */}
      {Platform.OS === 'ios' && <StatusBar barStyle="dark-content" backgroundColor="#FFF" />}
      {/* Wrap NavigationContainer in SafeAreaView only on iOS to handle notch and safe areas */}
      {Platform.OS === 'ios' ? (
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>
          {navigationContent}
        </SafeAreaView>
      ) : (
        navigationContent
      )}
    </>
  );
}

export default function App() {
  // Temporary: Test if React renders at all
  console.log('🚀 App component rendering');

  return (
    <ErrorBoundary>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>SpeakEasy TEST</Text>
        <Text style={styles.loadingSubtext}>React is working!</Text>
      </View>
    </ErrorBoundary>
  );

  /* Full app - temporarily disabled for debugging
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <AppProvider>
              <AppNavigator />
            </AppProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
  */
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'ios' ? 44 : 0 // Add padding top for iOS notch
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Platform.OS === 'ios' ? '#007AFF' : '#007AFF' // Use iOS blue for iOS
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
    marginTop: 8
  },
  tabBar: {
    height: Platform.OS === 'ios' ? 65 : 60,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  tabBarLabel: {
    fontWeight: '600',
    fontSize: 10,
    marginTop: 2
  }
});
