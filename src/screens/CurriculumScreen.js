import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { LESSONS } from '../config/lessons.config';
import UserMenu from '../components/UserMenu';

export default function CurriculumScreen({ navigation }) {
  const { userProfile, lessonProgress, currentLessonId, getCurriculumProgress, getPhaseProgress, isLessonUnlocked } = useApp();
  const { theme, isDark } = useTheme();
  const [overallProgress, setOverallProgress] = useState({ percentage: 0, completed: 0, total: 30 });
  const [expandedPhase, setExpandedPhase] = useState(1);

  useEffect(() => {
    if (lessonProgress) {
      const progress = getCurriculumProgress();
      setOverallProgress(progress);

      // Expand the phase containing the current lesson
      if (currentLessonId) {
        const currentLesson = LESSONS.find(l => l.id === currentLessonId);
        if (currentLesson) {
          setExpandedPhase(currentLesson.phase);
        }
      }
    }
  }, [lessonProgress, currentLessonId]);

  const phases = [
    { id: 1, name: 'Foundation', icon: '🔤', description: 'Pronunciation & Basics', color: '#007AFF' },
    { id: 2, name: 'Daily Life', icon: '🏠', description: 'Survival Language', color: '#34C759' },
    { id: 3, name: 'Communication', icon: '💬', description: 'Building Fluency', color: '#FF9500' },
    { id: 4, name: 'Fluency', icon: '🎯', description: 'Natural Conversation', color: '#AF52DE' },
  ];

  const getLessonsByPhase = (phase) => {
    return LESSONS.filter(lesson => lesson.phase === phase);
  };

  const getLessonStatus = (lessonId) => {
    const progress = lessonProgress[lessonId];
    const unlocked = isLessonUnlocked(lessonId);

    if (progress?.completed && progress?.quizPassed) {
      return { status: 'completed', icon: '✓', color: '#34C759' };
    } else if (progress?.started && !progress?.completed) {
      return { status: 'in-progress', icon: '◐', color: '#FF9500' };
    } else if (unlocked) {
      return { status: 'unlocked', icon: '○', color: '#007AFF' };
    } else {
      return { status: 'locked', icon: '🔒', color: '#999' };
    }
  };

  const navigateToLesson = (lessonId) => {
    const unlocked = isLessonUnlocked(lessonId);
    if (unlocked) {
      navigation.navigate('LessonDetail', { lessonId });
    }
  };

  const renderPhaseCard = (phase) => {
    const phaseLessons = getLessonsByPhase(phase.id);
    const phaseProgress = getPhaseProgress(phase.id);
    const isExpanded = expandedPhase === phase.id;

    return (
      <View key={phase.id} style={[styles.phaseCard, { backgroundColor: theme.card }]}>
        {/* Phase Header */}
        <TouchableOpacity
          style={styles.phaseHeader}
          onPress={() => setExpandedPhase(isExpanded ? null : phase.id)}
        >
          <View style={styles.phaseHeaderLeft}>
            <View style={[styles.phaseIconContainer, { backgroundColor: phase.color + '20' }]}>
              <Text style={styles.phaseIcon}>{phase.icon}</Text>
            </View>
            <View style={styles.phaseInfo}>
              <Text style={[styles.phaseName, { color: theme.text }]}>
                Phase {phase.id}: {phase.name}
              </Text>
              <Text style={[styles.phaseDescription, { color: theme.textSecondary }]}>
                {phase.description}
              </Text>
            </View>
          </View>
          <View style={styles.phaseHeaderRight}>
            <Text style={[styles.phaseProgress, { color: phase.color }]}>
              {phaseProgress.percentage}%
            </Text>
            <Text style={[styles.expandIcon, { color: theme.textSecondary }]}>
              {isExpanded ? '▼' : '▶'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Phase Progress Bar */}
        <View style={[styles.phaseProgressBarContainer, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.phaseProgressBar,
              { width: `${phaseProgress.percentage}%`, backgroundColor: phase.color }
            ]}
          />
        </View>

        {/* Lessons List */}
        {isExpanded && (
          <View style={styles.lessonsContainer}>
            {phaseLessons.map((lesson, index) => {
              const status = getLessonStatus(lesson.id);
              const isCurrent = lesson.id === currentLessonId;

              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[
                    styles.lessonItem,
                    { borderLeftColor: phase.color },
                    isCurrent && styles.currentLesson,
                  ]}
                  onPress={() => navigateToLesson(lesson.id)}
                  disabled={status.status === 'locked'}
                >
                  <View style={styles.lessonItemLeft}>
                    <View style={[styles.lessonNumber, { backgroundColor: status.color + '20' }]}>
                      <Text style={[styles.lessonNumberText, { color: status.color }]}>
                        {status.icon}
                      </Text>
                    </View>
                    <View style={styles.lessonItemInfo}>
                      <Text
                        style={[
                          styles.lessonTitle,
                          { color: status.status === 'locked' ? theme.textTertiary : theme.text }
                        ]}
                        numberOfLines={1}
                      >
                        {lesson.id}. {lesson.title}
                      </Text>
                      <Text style={[styles.lessonMeta, { color: theme.textSecondary }]}>
                        {lesson.estimatedMinutes} min • {lesson.topics.slice(0, 2).join(', ')}
                      </Text>
                    </View>
                  </View>
                  {isCurrent && (
                    <View style={[styles.currentBadge, { backgroundColor: phase.color }]}>
                      <Text style={styles.currentBadgeText}>CURRENT</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  if (!userProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <UserMenu navigation={navigation} />
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, { backgroundColor: theme.card }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>
              Language Curriculum 🎓
            </Text>
            <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>
              30 Lessons to Conversational Fluency
            </Text>
          </View>
          <View style={styles.overallProgressCircle}>
            <Text style={[styles.overallProgressPercentage, { color: '#007AFF' }]}>
              {overallProgress.percentage}%
            </Text>
            <Text style={[styles.overallProgressLabel, { color: theme.textSecondary }]}>
              Complete
            </Text>
          </View>
        </View>
        {/* Progress Bar */}
        <View style={[styles.headerProgressBarContainer, { backgroundColor: theme.border }]}>
          <View style={[styles.headerProgressBarFill, { width: `${overallProgress.percentage}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Overall Progress Card */}
        <View style={[styles.overallProgressCard, { backgroundColor: theme.card }]}>
          <View style={styles.overallProgressHeader}>
            <Text style={[styles.overallProgressTitle, { color: theme.text }]}>
              Your Progress
            </Text>
            <Text style={[styles.overallProgressPercentage, { color: '#007AFF' }]}>
              {overallProgress.percentage}%
            </Text>
          </View>
          <View style={[styles.overallProgressBarContainer, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.overallProgressBar,
                { width: `${overallProgress.percentage}%` }
              ]}
            />
          </View>
          <Text style={[styles.overallProgressText, { color: theme.textSecondary }]}>
            {overallProgress.completed} of {overallProgress.total} lessons completed
          </Text>
          {currentLessonId && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigateToLesson(currentLessonId)}
            >
              <Text style={styles.continueButtonText}>Continue Lesson {currentLessonId}</Text>
              <Text style={styles.continueButtonIcon}>→</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Learning Path */}
        <View style={styles.learningPathContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Learning Path</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Complete lessons in order to unlock the next
          </Text>

          {/* Phase Cards */}
          {phases.map(phase => renderPhaseCard(phase))}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  fixedHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 14,
  },
  overallProgressCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallProgressPercentage: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  overallProgressLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  headerProgressBarContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  headerProgressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  overallProgressCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  overallProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overallProgressTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  overallProgressPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  overallProgressBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  overallProgressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  overallProgressText: {
    fontSize: 14,
  },
  continueButton: {
    marginTop: 16,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonIcon: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  learningPathContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  phaseCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  phaseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phaseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  phaseIcon: {
    fontSize: 24,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  phaseDescription: {
    fontSize: 14,
  },
  phaseHeaderRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  phaseProgress: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  expandIcon: {
    fontSize: 12,
  },
  phaseProgressBarContainer: {
    height: 4,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 2,
    overflow: 'hidden',
  },
  phaseProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  lessonsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderLeftWidth: 3,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  currentLesson: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
  },
  lessonItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lessonItemInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  lessonMeta: {
    fontSize: 12,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});
