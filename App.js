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

// Screens
import NewAuthScreen from './src/screens/NewAuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
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
import ImmersionScreen from './src/screens/ImmersionScreen';
import FluencyAnalyzerScreen from './src/screens/FluencyAnalyzerScreen';
import CulturalContextScreen from './src/screens/CulturalContextScreen';
import WritingWorkshopScreen from './src/screens/WritingWorkshopScreen';
import ProgressDashboardScreen from './src/screens/ProgressDashboardScreen';
import { Ionicons } from '@expo/vector-icons';
import ErrorBoundary from './src/components/ErrorBoundary';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen name="Learn" component={LearnNavigatorScreen}
        options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'book' : 'book-outline'} size={24} color={color} /> }} />
      <Tab.Screen name="Practice" component={PracticeNavigatorScreen}
        options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={color} /> }} />
      <Tab.Screen name="Music" component={MusicScreen}
        options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'musical-notes' : 'musical-notes-outline'} size={24} color={color} /> }} />
      <Tab.Screen name="Leagues" component={LeaguesScreen}
        options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'trophy' : 'trophy-outline'} size={24} color={color} /> }} />
      <Tab.Screen name="More" component={MoreScreen}
        options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'ellipsis-horizontal-circle' : 'ellipsis-horizontal-circle-outline'} size={24} color={color} /> }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isLoading: appLoading } = useApp();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setLoadingTimeout(true), Platform.OS === 'web' ? 3000 : 5000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isAuthenticated) checkOnboarding();
    else setOnboardingComplete(false);
  }, [isAuthenticated]);

  const checkOnboarding = async () => {
    const complete = await StorageService.isOnboardingComplete();
    setOnboardingComplete(complete);
  };

  const isLoading = !loadingTimeout && (authLoading || appLoading || (isAuthenticated && onboardingComplete === null));

  if (isLoading) {
    return <View style={styles.loadingContainer}><Text style={styles.loadingText}>SpeakEasy 🚀</Text><Text style={styles.loadingSubtext}>Your AI Language Tutor</Text></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={NewAuthScreen} />
        ) : !onboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: true, headerTitle: '', headerBackTitle: 'Back' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, headerTitle: 'Settings', headerBackTitle: 'Back' }} />
            <Stack.Screen name="Review" component={ReviewScreen} options={{ headerShown: true, headerTitle: 'Review', headerBackTitle: 'Back' }} />
            <Stack.Screen name="LyricsLesson" component={LyricsLessonScreen} options={{ headerShown: true, headerTitle: 'Music Lesson', headerBackTitle: 'Back' }} />
            <Stack.Screen name="LessonDetail" component={LessonDetailScreen} options={{ headerShown: true, headerTitle: 'Lesson', headerBackTitle: 'Back' }} />
            <Stack.Screen name="Quiz" component={QuizScreen} options={{ headerShown: true, headerTitle: 'Quiz', headerBackTitle: 'Back' }} />
            <Stack.Screen name="Immersion" component={ImmersionScreen} options={{ headerShown: false }} />
            <Stack.Screen name="FluencyAnalyzer" component={FluencyAnalyzerScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CulturalContext" component={CulturalContextScreen} options={{ headerShown: false }} />
            <Stack.Screen name="WritingWorkshop" component={WritingWorkshopScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ProgressDashboard" component={ProgressDashboardScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <AppProvider>
              {Platform.OS === 'ios' ? (
                <SafeAreaView style={styles.container}><AppNavigator /></SafeAreaView>
              ) : (
                <View style={styles.container}><AppNavigator /></View>
              )}
            </AppProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { fontSize: 32, fontWeight: 'bold', color: '#007AFF', marginBottom: 8 },
  loadingSubtext: { fontSize: 16, color: '#666' },
  tabBar: { borderTopWidth: 1, borderTopColor: '#E5E5EA', paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 20 : 8, height: Platform.OS === 'ios' ? 88 : 64 },
});
