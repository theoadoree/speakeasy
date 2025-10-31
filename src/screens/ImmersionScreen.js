/**
 * ImmersionScreen - Complete language immersion hub
 *
 * Features:
 * - News articles in target language
 * - Podcast recommendations
 * - Video content with subtitles
 * - Social media feed simulation
 * - Real-time translation toggle
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  Image,
  Linking,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import LLMService from '../services/llm';
import UserMenu from '../components/UserMenu';

export default function ImmersionScreen({ navigation }) {
  const { userProfile } = useApp();
  const { theme } = useTheme();
  const [contentType, setContentType] = useState('news');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('intermediate');

  const contentTypes = [
    { id: 'news', icon: '📰', title: 'News' },
    { id: 'podcasts', icon: '🎙️', title: 'Podcasts' },
    { id: 'videos', icon: '📺', title: 'Videos' },
    { id: 'social', icon: '💬', title: 'Social Media' },
  ];

  const levels = [
    { id: 'beginner', label: 'Beginner', description: 'Simple language' },
    { id: 'intermediate', label: 'Intermediate', description: 'Natural speech' },
    { id: 'advanced', label: 'Advanced', description: 'Native content' },
  ];

  useEffect(() => {
    loadContent();
  }, [contentType, selectedLevel]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const result = await generateImmersionContent(contentType, selectedLevel);
      if (result.success) {
        setContent(result.content || []);
      }
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateImmersionContent = async (type, level) => {
    const interests = userProfile?.interests?.join(', ') || 'general topics';
    const targetLanguage = userProfile?.targetLanguage || 'Spanish';

    const prompts = {
      news: `Generate 5 news article headlines and summaries in ${targetLanguage} at ${level} level about ${interests}. Format as JSON array with: title, summary (2-3 sentences), source, category, readTime.`,
      podcasts: `Generate 5 podcast episode descriptions in ${targetLanguage} at ${level} level about ${interests}. Format as JSON array with: title, description, duration, host, topics.`,
      videos: `Generate 5 video content descriptions in ${targetLanguage} at ${level} level about ${interests}. Format as JSON array with: title, description, length, creator, subtitles.`,
      social: `Generate 5 social media posts in ${targetLanguage} at ${level} level about ${interests}. Format as JSON array with: author, content, likes, comments, platform.`
    };

    const result = await LLMService.generate(prompts[type]);

    if (result.success) {
      try {
        const jsonMatch = result.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return {
            success: true,
            content: JSON.parse(jsonMatch[0])
          };
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    }

    return { success: false, content: [] };
  };

  const handleContentPress = async (item) => {
    navigation.navigate('Reader', {
      content: {
        title: item.title || item.author,
        text: item.summary || item.description || item.content,
        type: contentType,
        language: userProfile.targetLanguage
      }
    });
  };

  const renderContentCard = (item, index) => {
    switch (contentType) {
      case 'news':
        return (
          <TouchableOpacity
            key={index}
            style={[styles.contentCard, { backgroundColor: theme.card }]}
            onPress={() => handleContentPress(item)}
          >
            <View style={styles.newsHeader}>
              <Text style={[styles.newsCategory, { color: theme.primary }]}>
                {item.category || 'News'}
              </Text>
              <Text style={[styles.readTime, { color: theme.textSecondary }]}>
                {item.readTime || '5 min'}
              </Text>
            </View>
            <Text style={[styles.newsTitle, { color: theme.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.newsSummary, { color: theme.textSecondary }]} numberOfLines={2}>
              {item.summary}
            </Text>
            <Text style={[styles.newsSource, { color: theme.textSecondary }]}>
              {item.source || 'News Source'}
            </Text>
          </TouchableOpacity>
        );

      case 'podcasts':
        return (
          <TouchableOpacity
            key={index}
            style={[styles.contentCard, { backgroundColor: theme.card }]}
            onPress={() => handleContentPress(item)}
          >
            <View style={styles.podcastHeader}>
              <Text style={styles.podcastIcon}>🎙️</Text>
              <View style={styles.podcastInfo}>
                <Text style={[styles.podcastTitle, { color: theme.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.podcastHost, { color: theme.textSecondary }]}>
                  {item.host || 'Host'} · {item.duration || '30 min'}
                </Text>
              </View>
            </View>
            <Text style={[styles.podcastDescription, { color: theme.textSecondary }]} numberOfLines={3}>
              {item.description}
            </Text>
          </TouchableOpacity>
        );

      case 'videos':
        return (
          <TouchableOpacity
            key={index}
            style={[styles.contentCard, { backgroundColor: theme.card }]}
            onPress={() => handleContentPress(item)}
          >
            <View style={styles.videoThumbnail}>
              <Text style={styles.playIcon}>▶️</Text>
              <Text style={[styles.videoLength, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                {item.length || '10:30'}
              </Text>
            </View>
            <View style={styles.videoInfo}>
              <Text style={[styles.videoTitle, { color: theme.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.videoCreator, { color: theme.textSecondary }]}>
                {item.creator || 'Creator'}
              </Text>
            </View>
          </TouchableOpacity>
        );

      case 'social':
        return (
          <View key={index} style={[styles.contentCard, { backgroundColor: theme.card }]}>
            <View style={styles.socialHeader}>
              <View style={styles.socialAvatar}>
                <Text style={styles.socialAvatarText}>
                  {item.author?.charAt(0) || '👤'}
                </Text>
              </View>
              <View style={styles.socialInfo}>
                <Text style={[styles.socialAuthor, { color: theme.text }]}>
                  {item.author || 'User'}
                </Text>
                <Text style={[styles.socialPlatform, { color: theme.textSecondary }]}>
                  {item.platform || 'Social'} · Just now
                </Text>
              </View>
            </View>
            <Text style={[styles.socialContent, { color: theme.text }]}>
              {item.content}
            </Text>
            <View style={styles.socialActions}>
              <Text style={[styles.socialAction, { color: theme.textSecondary }]}>
                ❤️ {item.likes || 0}
              </Text>
              <Text style={[styles.socialAction, { color: theme.textSecondary }]}>
                💬 {item.comments || 0}
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <UserMenu navigation={navigation} />

      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Immersion Hub 🌍
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Real {userProfile?.targetLanguage || 'language'} content
          </Text>
        </View>

        <View style={styles.translationToggle}>
          <Text style={[styles.toggleLabel, { color: theme.text }]}>Translate</Text>
          <Switch
            value={showTranslations}
            onValueChange={setShowTranslations}
            trackColor={{ false: '#ccc', true: '#007AFF' }}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contentTypeTabs}>
          {contentTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeTab,
                contentType === type.id && styles.typeTabActive,
                { backgroundColor: contentType === type.id ? theme.primary : theme.card }
              ]}
              onPress={() => setContentType(type.id)}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text style={[
                styles.typeText,
                contentType === type.id && styles.typeTextActive,
                { color: contentType === type.id ? '#FFF' : theme.text }
              ]}>
                {type.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.levelSelector}>
          <Text style={[styles.levelTitle, { color: theme.text }]}>Content Level</Text>
          <View style={styles.levelButtons}>
            {levels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.levelButton,
                  selectedLevel === level.id && styles.levelButtonActive,
                  {
                    backgroundColor: selectedLevel === level.id ? theme.primary : theme.card,
                    borderColor: theme.border
                  }
                ]}
                onPress={() => setSelectedLevel(level.id)}
              >
                <Text style={[
                  styles.levelLabel,
                  { color: selectedLevel === level.id ? '#FFF' : theme.text }
                ]}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.contentList}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Loading {contentType}...
              </Text>
            </View>
          ) : content.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🌍</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No content available
              </Text>
              <TouchableOpacity
                style={[styles.refreshButton, { backgroundColor: theme.primary }]}
                onPress={loadContent}
              >
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            content.map((item, index) => renderContentCard(item, index))
          )}
        </View>

        <View style={[styles.tipsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.tipsTitle, { color: theme.text }]}>💡 Immersion Tips</Text>
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            • Spend 30+ minutes daily with real content{'\n'}
            • Don't translate everything - understand from context{'\n'}
            • Save unknown words to review later{'\n'}
            • Listen to content multiple times{'\n'}
            • Shadow speakers to improve pronunciation
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  translationToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel: { fontSize: 14, fontWeight: '600' },
  contentTypeTabs: { paddingHorizontal: 20, paddingVertical: 16, maxHeight: 70 },
  typeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    gap: 8,
  },
  typeTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeIcon: { fontSize: 20 },
  typeText: { fontSize: 16, fontWeight: '600' },
  typeTextActive: { color: '#FFF' },
  levelSelector: { paddingHorizontal: 20, marginBottom: 16 },
  levelTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  levelButtons: { flexDirection: 'row', gap: 12 },
  levelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  levelButtonActive: { borderColor: 'transparent' },
  levelLabel: { fontSize: 14, fontWeight: '600' },
  contentList: { paddingHorizontal: 20, paddingBottom: 20 },
  contentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  newsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  newsCategory: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  readTime: { fontSize: 12 },
  newsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, lineHeight: 24 },
  newsSummary: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  newsSource: { fontSize: 12, fontStyle: 'italic' },
  podcastHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  podcastIcon: { fontSize: 40, marginRight: 12 },
  podcastInfo: { flex: 1 },
  podcastTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  podcastHost: { fontSize: 13 },
  podcastDescription: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  videoThumbnail: {
    height: 180,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  playIcon: { fontSize: 48 },
  videoLength: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  videoInfo: { gap: 6 },
  videoTitle: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  videoCreator: { fontSize: 13 },
  socialHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  socialAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  socialAvatarText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  socialInfo: { flex: 1 },
  socialAuthor: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  socialPlatform: { fontSize: 12 },
  socialContent: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  socialActions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  socialAction: { fontSize: 14, fontWeight: '500' },
  loadingContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16, marginBottom: 20 },
  refreshButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  refreshButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  tipsCard: { margin: 20, padding: 20, borderRadius: 16, marginBottom: 40 },
  tipsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  tipText: { fontSize: 14, lineHeight: 22 },
});
