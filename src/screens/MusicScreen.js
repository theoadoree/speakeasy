import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../contexts/AppContext';
import MusicService from '../services/music';
import StorageService from '../utils/storage';

const MusicScreen = () => {
  const navigation = useNavigation();
  const { userProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [myLibrary, setMyLibrary] = useState([]);
  const [myLessons, setMyLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('search'); // 'search', 'library', 'lessons'
  const [serviceConfig, setServiceConfig] = useState({ spotify: false, appleMusic: false });

  useEffect(() => {
    loadLibrary();
    loadLessons();
    checkServiceConfig();
  }, []);

  const loadLibrary = async () => {
    const library = await StorageService.getMusicLibrary();
    setMyLibrary(library);
  };

  const loadLessons = async () => {
    const lessons = await StorageService.getMusicLessons();
    setMyLessons(lessons);
  };

  const checkServiceConfig = async () => {
    const config = MusicService.getConfigStatus();
    setServiceConfig(config);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }

    setLoading(true);

    try {
      const results = await MusicService.searchAll(searchQuery, 15);

      if (results.length === 0) {
        // Show demo results if no API is configured
        const demoResults = generateDemoResults(searchQuery);
        setSearchResults(demoResults);
      } else {
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to demo results
      const demoResults = generateDemoResults(searchQuery);
      setSearchResults(demoResults);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoResults = (query) => {
    // Generate demo results for testing when APIs are not configured
    return [
      {
        id: 'demo1',
        title: `${query} - Demo Song 1`,
        artist: 'Demo Artist',
        album: 'Demo Album',
        albumArt: null,
        duration: 180,
        source: 'demo'
      },
      {
        id: 'demo2',
        title: `${query} - Demo Song 2`,
        artist: 'Another Artist',
        album: 'Another Album',
        albumArt: null,
        duration: 240,
        source: 'demo'
      }
    ];
  };

  const handleAddToLibrary = async (song) => {
    const result = await StorageService.addSongToLibrary(song);

    if (result.success) {
      Alert.alert('Success', 'Song added to your library!');
      await loadLibrary();
    } else {
      Alert.alert('Error', 'Failed to add song to library');
    }
  };

  const handleRemoveFromLibrary = async (songId) => {
    Alert.alert(
      'Remove Song',
      'Are you sure you want to remove this song from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const result = await StorageService.removeSongFromLibrary(songId);
            if (result.success) {
              await loadLibrary();
            }
          }
        }
      ]
    );
  };

  const handleCreateLesson = async (song) => {
    setLoading(true);

    try {
      // Fetch lyrics
      const lyrics = await MusicService.getLyrics(song.artist, song.title);

      if (!lyrics) {
        Alert.alert('Error', 'Could not fetch lyrics for this song.');
        setLoading(false);
        return;
      }

      // Navigate to lyrics lesson screen
      navigation.navigate('LyricsLesson', {
        song,
        lyrics
      });
    } catch (error) {
      console.error('Error creating lesson:', error);
      Alert.alert('Error', 'Failed to create lesson from this song.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSongItem = ({ item, showActions = true, inLibrary = false }) => {
    return (
      <View style={styles.songItem}>
        <View style={styles.albumArtContainer}>
          {item.albumArt ? (
            <Image source={{ uri: item.albumArt }} style={styles.albumArt} />
          ) : (
            <View style={styles.albumArtPlaceholder}>
              <Ionicons name="musical-notes" size={24} color="#999" />
            </View>
          )}
        </View>

        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
          <View style={styles.songMeta}>
            <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>
            {item.source !== 'demo' && (
              <View style={styles.sourceTag}>
                <Text style={styles.sourceText}>
                  {item.source === 'spotify' ? 'Spotify' : 'Apple Music'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {showActions && (
          <View style={styles.songActions}>
            {!inLibrary ? (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAddToLibrary(item)}
                >
                  <Ionicons name="add-circle" size={28} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleCreateLesson(item)}
                >
                  <Ionicons name="school" size={28} color="#007AFF" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleCreateLesson(item)}
                >
                  <Ionicons name="school" size={28} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleRemoveFromLibrary(item.id)}
                >
                  <Ionicons name="trash" size={28} color="#F44336" />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderSearchTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* Service Status */}
        {!serviceConfig.spotify && !serviceConfig.appleMusic && (
          <View style={styles.configNotice}>
            <Ionicons name="information-circle" size={24} color="#FF9800" />
            <Text style={styles.configNoticeText}>
              Music APIs not configured. Using demo mode. Configure in Settings for full functionality.
            </Text>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for songs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
              {searchResults.length} Results for "{searchQuery}"
            </Text>
            <FlatList
              data={searchResults}
              renderItem={({ item }) => renderSongItem({ item, showActions: true, inLibrary: false })}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              scrollEnabled={false}
            />
          </View>
        )}

        {searchResults.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>
              Search for songs to create custom language lessons
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Learn {userProfile?.targetLanguage || 'your target language'} through music!
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderLibraryTab = () => {
    return (
      <View style={styles.tabContent}>
        {myLibrary.length > 0 ? (
          <FlatList
            data={myLibrary}
            renderItem={({ item }) => renderSongItem({ item, showActions: true, inLibrary: true })}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.libraryList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>Your music library is empty</Text>
            <Text style={styles.emptyStateSubtext}>
              Search for songs and add them to your library
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderLessonsTab = () => {
    return (
      <View style={styles.tabContent}>
        {myLessons.length > 0 ? (
          <FlatList
            data={myLessons}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.lessonCard}
                onPress={() => navigation.navigate('LyricsLesson', {
                  song: item.song,
                  lyrics: item.lyrics,
                  lessonData: item.lessonData
                })}
              >
                <View style={styles.lessonCardHeader}>
                  {item.song.albumArt ? (
                    <Image source={{ uri: item.song.albumArt }} style={styles.lessonAlbumArt} />
                  ) : (
                    <View style={styles.lessonAlbumArtPlaceholder}>
                      <Ionicons name="musical-notes" size={20} color="#999" />
                    </View>
                  )}
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle} numberOfLines={1}>{item.song.title}</Text>
                    <Text style={styles.lessonArtist} numberOfLines={1}>{item.song.artist}</Text>
                    <Text style={styles.lessonDate}>
                      Created {new Date(item.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Delete Lesson',
                        'Are you sure you want to delete this lesson?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: async () => {
                              await StorageService.deleteMusicLesson(item.id);
                              await loadLessons();
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={24} color="#F44336" />
                  </TouchableOpacity>
                </View>

                {item.lessonData && (
                  <View style={styles.lessonStats}>
                    <View style={styles.lessonStat}>
                      <Ionicons name="book" size={16} color="#007AFF" />
                      <Text style={styles.lessonStatText}>
                        {item.lessonData.vocabulary?.length || 0} words
                      </Text>
                    </View>
                    <View style={styles.lessonStat}>
                      <Ionicons name="chatbubbles" size={16} color="#4CAF50" />
                      <Text style={styles.lessonStatText}>
                        {item.lessonData.phrases?.length || 0} phrases
                      </Text>
                    </View>
                    <View style={styles.lessonStat}>
                      <Ionicons name="create" size={16} color="#FF9800" />
                      <Text style={styles.lessonStatText}>
                        {item.lessonData.exercises?.length || 0} exercises
                      </Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.lessonsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="school" size={64} color="#CCC" />
            <Text style={styles.emptyStateText}>No lessons created yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Create lessons from your favorite songs
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="musical-note" size={36} color="#007AFF" />
        <Text style={styles.title}>Music Lessons</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'search' && styles.tabActive]}
          onPress={() => setSelectedTab('search')}
        >
          <Ionicons
            name="search"
            size={20}
            color={selectedTab === 'search' ? '#007AFF' : '#666'}
          />
          <Text style={[styles.tabText, selectedTab === 'search' && styles.tabTextActive]}>
            Search
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'library' && styles.tabActive]}
          onPress={() => setSelectedTab('library')}
        >
          <Ionicons
            name="library"
            size={20}
            color={selectedTab === 'library' ? '#007AFF' : '#666'}
          />
          <Text style={[styles.tabText, selectedTab === 'library' && styles.tabTextActive]}>
            Library ({myLibrary.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'lessons' && styles.tabActive]}
          onPress={() => setSelectedTab('lessons')}
        >
          <Ionicons
            name="book"
            size={20}
            color={selectedTab === 'lessons' ? '#007AFF' : '#666'}
          />
          <Text style={[styles.tabText, selectedTab === 'lessons' && styles.tabTextActive]}>
            Lessons ({myLessons.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {selectedTab === 'search' && renderSearchTab()}
        {selectedTab === 'library' && renderLibraryTab()}
        {selectedTab === 'lessons' && renderLessonsTab()}
      </ScrollView>
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
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6
  },
  tabActive: {
    borderBottomColor: '#007AFF'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  tabTextActive: {
    color: '#007AFF'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1
  },
  tabContent: {
    flex: 1,
    padding: 16
  },
  configNotice: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    alignItems: 'flex-start'
  },
  configNoticeText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333'
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    minWidth: 80,
    alignItems: 'center'
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  resultsContainer: {
    marginTop: 8
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  songItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  albumArtContainer: {
    width: 60,
    height: 60
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 8
  },
  albumArtPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  songInfo: {
    flex: 1
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  songArtist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  songDuration: {
    fontSize: 12,
    color: '#999'
  },
  sourceTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#007AFF'
  },
  songActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    padding: 4
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
    marginBottom: 8
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#BBB',
    textAlign: 'center'
  },
  libraryList: {
    paddingBottom: 16
  },
  lessonsList: {
    paddingBottom: 16
  },
  lessonCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  lessonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  lessonAlbumArt: {
    width: 50,
    height: 50,
    borderRadius: 8
  },
  lessonAlbumArtPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  lessonInfo: {
    flex: 1
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  lessonArtist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2
  },
  lessonDate: {
    fontSize: 12,
    color: '#999'
  },
  lessonStats: {
    flexDirection: 'row',
    gap: 16
  },
  lessonStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  lessonStatText: {
    fontSize: 12,
    color: '#666'
  }
});

export default MusicScreen;
