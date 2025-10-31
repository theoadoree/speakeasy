/**
 * ProgressDashboardScreen - Comprehensive fluency tracking
 *
 * Features:
 * - Overall fluency score
 * - Skill breakdown (speaking, writing, listening, reading)
 * - Days to fluency prediction
 * - Weekly progress charts
 * - Personalized recommendations
 * - Achievement milestones
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import FluencyService from '../services/fluency';
import UserMenu from '../components/UserMenu';

const { width } = Dimensions.get('window');

export default function ProgressDashboardScreen({ navigation }) {
  const { userProfile } = useApp();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    setLoading(true);
    try {
      // Mock activity history - in production, this would come from the app
      const activityHistory = {
        vocabularyCards: Array(500).fill({}),
        quizResults: [75, 80, 85, 82, 88],
        speakingAnalyses: [{ overallScore: 70 }, { overallScore: 75 }, { overallScore: 78 }],
        listeningComprehension: Array(25).fill({}),
        writingAnalyses: [{ overallScore: 65 }, { overallScore: 72 }],
        culturalLessons: Array(15).fill({}),
        dailyStreak: 14,
      };

      const result = await FluencyService.calculateFluencyScore(userProfile, activityHistory);
      if (result.success) {
        setProgressData(result);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Analyzing your progress...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <UserMenu navigation={navigation} />

      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Progress Dashboard 📊
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Track your journey to fluency
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Overall Score */}
        <View style={[styles.overallCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.overallLabel, { color: theme.textSecondary }]}>
            Overall Fluency Score
          </Text>
          <Text style={[styles.overallScore, { color: getScoreColor(progressData?.overallScore) }]}>
            {progressData?.overallScore || 0}/100
          </Text>
          <Text style={[styles.fluencyLevel, { color: theme.text }]}>
            {progressData?.fluencyLevel || 'Calculating...'}
          </Text>

          {progressData?.estimatedDaysToFluency > 0 && (
            <View style={styles.predictionContainer}>
              <Text style={[styles.predictionLabel, { color: theme.textSecondary }]}>
                Estimated days to Advanced (C1):
              </Text>
              <Text style={[styles.predictionValue, { color: theme.primary }]}>
                {progressData.estimatedDaysToFluency} days
              </Text>
              <Text style={[styles.predictionSubtext, { color: theme.textSecondary }]}>
                With consistent daily practice
              </Text>
            </View>
          )}
        </View>

        {/* Skill Breakdown */}
        <View style={[styles.skillsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Skill Breakdown</Text>

          {progressData?.scores && Object.entries(progressData.scores).map(([skill, score]) => (
            <View key={skill} style={styles.skillRow}>
              <View style={styles.skillHeader}>
                <Text style={[styles.skillName, { color: theme.text }]}>
                  {skill.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
                <Text style={[styles.skillScore, { color: getScoreColor(score) }]}>
                  {Math.round(score)}%
                </Text>
              </View>
              <View style={[styles.skillBarContainer, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.skillBar,
                    { width: `${score}%`, backgroundColor: getScoreColor(score) }
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        <View style={[styles.recommendationsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            📌 Personalized Recommendations
          </Text>
          {progressData?.recommendations?.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationBullet}>•</Text>
              <Text style={[styles.recommendationText, { color: theme.text }]}>
                {rec}
              </Text>
            </View>
          ))}
        </View>

        {/* Weekly Goals */}
        <View style={[styles.goalsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>🎯 Weekly Goals</Text>

          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={[styles.goalName, { color: theme.text }]}>Speaking Practice</Text>
              <Text style={[styles.goalProgress, { color: theme.text }]}>5/7 days</Text>
            </View>
            <View style={[styles.goalBarContainer, { backgroundColor: theme.border }]}>
              <View style={[styles.goalBar, { width: '71%', backgroundColor: '#4CAF50' }]} />
            </View>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={[styles.goalName, { color: theme.text }]}>New Vocabulary</Text>
              <Text style={[styles.goalProgress, { color: theme.text }]}>45/50 words</Text>
            </View>
            <View style={[styles.goalBarContainer, { backgroundColor: theme.border }]}>
              <View style={[styles.goalBar, { width: '90%', backgroundColor: '#4CAF50' }]} />
            </View>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={[styles.goalName, { color: theme.text }]}>Lesson Completion</Text>
              <Text style={[styles.goalProgress, { color: theme.text }]}>3/5 lessons</Text>
            </View>
            <View style={[styles.goalBarContainer, { backgroundColor: theme.border }]}>
              <View style={[styles.goalBar, { width: '60%', backgroundColor: '#FF9800' }]} />
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={[styles.achievementsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>🏆 Recent Achievements</Text>

          <View style={styles.achievementGrid}>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>🔥</Text>
              <Text style={[styles.achievementName, { color: theme.text }]}>14-Day Streak</Text>
            </View>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>📚</Text>
              <Text style={[styles.achievementName, { color: theme.text }]}>500 Words</Text>
            </View>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>🎤</Text>
              <Text style={[styles.achievementName, { color: theme.text }]}>Voice Master</Text>
            </View>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>✍️</Text>
              <Text style={[styles.achievementName, { color: theme.text }]}>Writing Pro</Text>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.tipsTitle, { color: theme.text }]}>💡 Maximize Your Progress</Text>
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            • Practice daily for at least 20 minutes{'\n'}
            • Focus on your weakest skills{'\n'}
            • Use immersion content regularly{'\n'}
            • Review vocabulary with spaced repetition{'\n'}
            • Practice speaking out loud daily{'\n'}
            • Set specific, achievable weekly goals
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  overallCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  overallLabel: { fontSize: 14, marginBottom: 8 },
  overallScore: { fontSize: 56, fontWeight: 'bold', marginBottom: 8 },
  fluencyLevel: { fontSize: 20, fontWeight: '600', marginBottom: 20 },
  predictionContainer: { alignItems: 'center', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E5E5EA', width: '100%' },
  predictionLabel: { fontSize: 13, marginBottom: 8 },
  predictionValue: { fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
  predictionSubtext: { fontSize: 12 },
  skillsCard: { marginHorizontal: 20, marginBottom: 16, padding: 20, borderRadius: 16 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  skillRow: { marginBottom: 20 },
  skillHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  skillName: { fontSize: 15, fontWeight: '500' },
  skillScore: { fontSize: 15, fontWeight: 'bold' },
  skillBarContainer: { height: 8, borderRadius: 4, overflow: 'hidden' },
  skillBar: { height: '100%', borderRadius: 4 },
  recommendationsCard: { marginHorizontal: 20, marginBottom: 16, padding: 20, borderRadius: 16 },
  recommendationItem: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
  recommendationBullet: { fontSize: 20, marginRight: 8, color: '#007AFF' },
  recommendationText: { flex: 1, fontSize: 15, lineHeight: 22 },
  goalsCard: { marginHorizontal: 20, marginBottom: 16, padding: 20, borderRadius: 16 },
  goalItem: { marginBottom: 16 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  goalName: { fontSize: 15, fontWeight: '500' },
  goalProgress: { fontSize: 14, fontWeight: '600' },
  goalBarContainer: { height: 8, borderRadius: 4, overflow: 'hidden' },
  goalBar: { height: '100%', borderRadius: 4 },
  achievementsCard: { marginHorizontal: 20, marginBottom: 16, padding: 20, borderRadius: 16 },
  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  achievementItem: { width: (width - 80) / 2, alignItems: 'center', padding: 16, backgroundColor: '#F5F5F5', borderRadius: 12 },
  achievementIcon: { fontSize: 32, marginBottom: 8 },
  achievementName: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  tipsCard: { margin: 20, padding: 20, borderRadius: 16, marginBottom: 40 },
  tipsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  tipText: { fontSize: 14, lineHeight: 22 },
});
