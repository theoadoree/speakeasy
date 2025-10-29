import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Platform,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import StorageService from '../utils/storage';

const LEAGUES = [
  { id: 'bronze', name: 'Bronze League', color: '#CD7F32', minXP: 0, icon: 'medal' },
  { id: 'silver', name: 'Silver League', color: '#C0C0C0', minXP: 500, icon: 'medal' },
  { id: 'gold', name: 'Gold League', color: '#FFD700', minXP: 1500, icon: 'medal' },
  { id: 'platinum', name: 'Platinum League', color: '#E5E4E2', minXP: 3000, icon: 'trophy' },
  { id: 'diamond', name: 'Diamond League', color: '#B9F2FF', minXP: 5000, icon: 'trophy' },
  { id: 'legendary', name: 'Legendary', color: '#FF1493', minXP: 10000, icon: 'star' }
];

const LeaguesScreen = () => {
  const { userProfile } = useApp();
  const [currentXP, setCurrentXP] = useState(0);
  const [currentLeague, setCurrentLeague] = useState(LEAGUES[0]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [selectedTab, setSelectedTab] = useState('league'); // 'league', 'achievements', 'stats'

  useEffect(() => {
    loadUserProgress();
    generateLeaderboard();
  }, []);

  useEffect(() => {
    // Update current league based on XP
    const league = [...LEAGUES].reverse().find(l => currentXP >= l.minXP) || LEAGUES[0];
    setCurrentLeague(league);
  }, [currentXP]);

  const loadUserProgress = async () => {
    try {
      // Load user progress from storage
      const progress = await StorageService.getUserProgress();
      if (progress) {
        setCurrentXP(progress.xp || 0);
        setStreak(progress.streak || 0);
        setAchievements(progress.achievements || []);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const generateLeaderboard = () => {
    // Generate mock leaderboard data
    // In a real app, this would come from a backend API
    const mockUsers = [
      { id: '1', name: 'You', xp: currentXP, avatar: '👤', isCurrentUser: true },
      { id: '2', name: 'Maria Rodriguez', xp: 4250, avatar: '👩', country: '🇪🇸' },
      { id: '3', name: 'Jean Dupont', xp: 3890, avatar: '👨', country: '🇫🇷' },
      { id: '4', name: 'Hans Mueller', xp: 3650, avatar: '🧑', country: '🇩🇪' },
      { id: '5', name: 'Yuki Tanaka', xp: 3420, avatar: '👨', country: '🇯🇵' },
      { id: '6', name: 'Sofia Rossi', xp: 3180, avatar: '👩', country: '🇮🇹' },
      { id: '7', name: 'Li Wei', xp: 2950, avatar: '🧑', country: '🇨🇳' },
      { id: '8', name: 'Ahmed Hassan', xp: 2720, avatar: '👨', country: '🇪🇬' },
      { id: '9', name: 'Ana Silva', xp: 2490, avatar: '👩', country: '🇧🇷' },
      { id: '10', name: 'Ivan Petrov', xp: 2260, avatar: '👨', country: '🇷🇺' }
    ];

    // Sort by XP and add rank
    const sorted = mockUsers
      .sort((a, b) => b.xp - a.xp)
      .map((user, index) => ({ ...user, rank: index + 1 }));

    setLeaderboard(sorted);
  };

  const getCurrentLeagueProgress = () => {
    const currentIndex = LEAGUES.findIndex(l => l.id === currentLeague.id);
    const nextLeague = LEAGUES[currentIndex + 1];

    if (!nextLeague) {
      return {
        progress: 100,
        remaining: 0,
        nextLeague: null
      };
    }

    const progress = ((currentXP - currentLeague.minXP) / (nextLeague.minXP - currentLeague.minXP)) * 100;
    const remaining = nextLeague.minXP - currentXP;

    return {
      progress: Math.min(progress, 100),
      remaining,
      nextLeague
    };
  };

  const renderLeagueBadge = (league, size = 80) => {
    return (
      <View style={[styles.leagueBadge, { width: size, height: size }]}>
        <View style={[styles.badgeInner, { borderColor: league.color }]}>
          <Ionicons name={league.icon} size={size * 0.5} color={league.color} />
        </View>
      </View>
    );
  };

  const renderLeaderboardItem = ({ item }) => {
    const medal = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : '';

    return (
      <View style={[styles.leaderboardItem, item.isCurrentUser && styles.leaderboardItemHighlight]}>
        <View style={styles.rankContainer}>
          {medal ? (
            <Text style={styles.medalIcon}>{medal}</Text>
          ) : (
            <Text style={styles.rankNumber}>#{item.rank}</Text>
          )}
        </View>

        <Text style={styles.userAvatar}>{item.avatar}</Text>

        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={[styles.userName, item.isCurrentUser && styles.currentUserName]}>
              {item.name}
            </Text>
            {item.country && <Text style={styles.countryFlag}>{item.country}</Text>}
          </View>
          <Text style={styles.userXP}>{item.xp.toLocaleString()} XP</Text>
        </View>

        {item.isCurrentUser && (
          <Ionicons name="star" size={20} color="#FFD700" />
        )}
      </View>
    );
  };

  const renderAchievement = (achievement) => {
    return (
      <View key={achievement.id} style={styles.achievementCard}>
        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
        <Text style={styles.achievementTitle}>{achievement.title}</Text>
        <Text style={styles.achievementDesc}>{achievement.description}</Text>
        {achievement.unlocked && (
          <View style={styles.achievementUnlocked}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.achievementUnlockedText}>Unlocked!</Text>
          </View>
        )}
      </View>
    );
  };

  const renderLeagueTab = () => {
    const { progress, remaining, nextLeague } = getCurrentLeagueProgress();

    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabScrollContent}>
        {/* Current League Display */}
        <View style={styles.currentLeagueContainer}>
          {renderLeagueBadge(currentLeague, 120)}
          <Text style={styles.leagueName}>{currentLeague.name}</Text>
          <Text style={styles.currentXP}>{currentXP.toLocaleString()} XP</Text>

          {nextLeague && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: nextLeague.color }]} />
              </View>
              <Text style={styles.progressText}>
                {remaining.toLocaleString()} XP to {nextLeague.name}
              </Text>
            </View>
          )}

          {/* Streak Display */}
          <View style={styles.streakContainer}>
            <Ionicons name="flame" size={24} color="#FF6B6B" />
            <Text style={styles.streakText}>{streak} day streak</Text>
          </View>
        </View>

        {/* All Leagues */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Leagues</Text>
          {LEAGUES.map((league, index) => {
            const isUnlocked = currentXP >= league.minXP;
            return (
              <View key={league.id} style={styles.leagueItem}>
                <View style={[styles.leagueItemBadge, !isUnlocked && styles.lockedBadge]}>
                  <Ionicons
                    name={league.icon}
                    size={24}
                    color={isUnlocked ? league.color : '#CCC'}
                  />
                </View>
                <View style={styles.leagueItemInfo}>
                  <Text style={[styles.leagueItemName, !isUnlocked && styles.lockedText]}>
                    {league.name}
                  </Text>
                  <Text style={styles.leagueItemXP}>
                    {league.minXP.toLocaleString()} XP minimum
                  </Text>
                </View>
                {isUnlocked && currentLeague.id === league.id && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
                {!isUnlocked && (
                  <Ionicons name="lock-closed" size={20} color="#CCC" />
                )}
              </View>
            );
          })}
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week's Leaderboard</Text>
          <FlatList
            data={leaderboard}
            renderItem={renderLeaderboardItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    );
  };

  const renderAchievementsTab = () => {
    const mockAchievements = [
      { id: 'first_lesson', icon: '🎯', title: 'First Steps', description: 'Complete your first lesson', unlocked: true },
      { id: 'week_streak', icon: '🔥', title: 'Week Warrior', description: 'Maintain a 7-day streak', unlocked: streak >= 7 },
      { id: 'hundred_words', icon: '📚', title: 'Vocabulary Master', description: 'Learn 100 new words', unlocked: false },
      { id: 'perfect_score', icon: '⭐', title: 'Perfectionist', description: 'Get 100% on any lesson', unlocked: true },
      { id: 'early_bird', icon: '🌅', title: 'Early Bird', description: 'Complete a lesson before 8 AM', unlocked: false },
      { id: 'night_owl', icon: '🦉', title: 'Night Owl', description: 'Complete a lesson after 10 PM', unlocked: true },
      { id: 'social_learner', icon: '👥', title: 'Social Learner', description: 'Share your progress with friends', unlocked: false },
      { id: 'music_fan', icon: '🎵', title: 'Music Fan', description: 'Complete 5 music-based lessons', unlocked: false }
    ];

    const unlockedCount = mockAchievements.filter(a => a.unlocked).length;

    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabScrollContent}>
        <View style={styles.achievementsHeader}>
          <Text style={styles.achievementsCount}>
            {unlockedCount} / {mockAchievements.length} Unlocked
          </Text>
        </View>

        <View style={styles.achievementsGrid}>
          {mockAchievements.map(renderAchievement)}
        </View>
      </ScrollView>
    );
  };

  const renderStatsTab = () => {
    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabScrollContent}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={32} color="#007AFF" />
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trophy" size={32} color="#FFD700" />
            <Text style={styles.statValue}>{currentXP}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="book" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Lessons Completed</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="time" size={32} color="#FF6B6B" />
            <Text style={styles.statValue}>8.5h</Text>
            <Text style={styles.statLabel}>Time Learning</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="text" size={32} color="#9C27B0" />
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Words Learned</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="chatbubbles" size={32} color="#FF9800" />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Conversations</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="trophy" size={36} color="#FFD700" />
        <Text style={styles.title}>Leagues</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'league' && styles.tabActive]}
          onPress={() => setSelectedTab('league')}
        >
          <Text style={[styles.tabText, selectedTab === 'league' && styles.tabTextActive]}>
            League
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'achievements' && styles.tabActive]}
          onPress={() => setSelectedTab('achievements')}
        >
          <Text style={[styles.tabText, selectedTab === 'achievements' && styles.tabTextActive]}>
            Achievements
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'stats' && styles.tabActive]}
          onPress={() => setSelectedTab('stats')}
        >
          <Text style={[styles.tabText, selectedTab === 'stats' && styles.tabTextActive]}>
            Stats
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {selectedTab === 'league' && renderLeagueTab()}
      {selectedTab === 'achievements' && renderAchievementsTab()}
      {selectedTab === 'stats' && renderStatsTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 12
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabActive: {
    borderBottomColor: '#007AFF'
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  tabTextActive: {
    color: '#007AFF'
  },
  tabContent: {
    flex: 1
  },
  tabScrollContent: {
    padding: 16
  },
  currentLeagueContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  leagueBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  badgeInner: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },
  leagueName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  currentXP: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16
  },
  progressContainer: {
    width: '100%',
    marginTop: 16
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 20
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  leagueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    gap: 12
  },
  leagueItemBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lockedBadge: {
    opacity: 0.5
  },
  leagueItemInfo: {
    flex: 1
  },
  leagueItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  lockedText: {
    color: '#999'
  },
  leagueItemXP: {
    fontSize: 14,
    color: '#666'
  },
  currentBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF'
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12
  },
  leaderboardItemHighlight: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#007AFF'
  },
  rankContainer: {
    width: 32,
    alignItems: 'center'
  },
  medalIcon: {
    fontSize: 24
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  userAvatar: {
    fontSize: 32
  },
  userInfo: {
    flex: 1
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  currentUserName: {
    color: '#007AFF'
  },
  countryFlag: {
    fontSize: 16
  },
  userXP: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  achievementsHeader: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center'
  },
  achievementsCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  achievementIcon: {
    fontSize: 48,
    marginBottom: 8
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4
  },
  achievementDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8
  },
  achievementUnlocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  achievementUnlockedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  }
});

export default LeaguesScreen;
