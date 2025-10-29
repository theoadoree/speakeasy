/**
 * MusicService - Integration with Apple Music and Spotify APIs
 *
 * This service provides functionality to:
 * - Search for songs on Apple Music and Spotify
 * - Fetch song lyrics
 * - Get track details
 * - Create custom lessons from song lyrics
 *
 * Note: Requires API keys for both services:
 * - Apple Music: Developer Token (https://developer.apple.com/documentation/applemusicapi)
 * - Spotify: Client ID & Client Secret (https://developer.spotify.com/dashboard)
 */

import axios from 'axios';
import LLMService from './llm';

class MusicService {
  constructor() {
    // Apple Music Configuration
    this.appleMusicToken = null; // Set your Apple Music Developer Token here
    this.appleMusicBaseUrl = 'https://api.music.apple.com/v1';

    // Spotify Configuration
    this.spotifyClientId = null; // Set your Spotify Client ID here
    this.spotifyClientSecret = null; // Set your Spotify Client Secret here
    this.spotifyAccessToken = null;
    this.spotifyBaseUrl = 'https://api.spotify.com/v1';

    // Lyrics API Configuration (using lyrics.ovh as fallback)
    this.lyricsApiUrl = 'https://api.lyrics.ovh/v1';
  }

  /**
   * Get Spotify Access Token using Client Credentials flow
   */
  async getSpotifyAccessToken() {
    if (this.spotifyAccessToken) {
      return this.spotifyAccessToken;
    }

    try {
      // In a production app, this should be done server-side to keep credentials secure
      const credentials = btoa(`${this.spotifyClientId}:${this.spotifyClientSecret}`);

      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.spotifyAccessToken = response.data.access_token;

      // Refresh token before it expires (usually 1 hour)
      setTimeout(() => {
        this.spotifyAccessToken = null;
      }, (response.data.expires_in - 60) * 1000);

      return this.spotifyAccessToken;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw error;
    }
  }

  /**
   * Search for songs on Spotify
   * @param {string} query - Search query (song name, artist, etc.)
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of song objects
   */
  async searchSpotify(query, limit = 20) {
    try {
      const token = await this.getSpotifyAccessToken();

      const response = await axios.get(`${this.spotifyBaseUrl}/search`, {
        params: {
          q: query,
          type: 'track',
          limit
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.tracks.items.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        album: track.album.name,
        albumArt: track.album.images[0]?.url,
        duration: Math.floor(track.duration_ms / 1000),
        previewUrl: track.preview_url,
        spotifyUrl: track.external_urls.spotify,
        source: 'spotify'
      }));
    } catch (error) {
      console.error('Error searching Spotify:', error);
      return [];
    }
  }

  /**
   * Search for songs on Apple Music
   * @param {string} query - Search query
   * @param {number} limit - Number of results
   * @returns {Promise<Array>} Array of song objects
   */
  async searchAppleMusic(query, limit = 20) {
    if (!this.appleMusicToken) {
      console.warn('Apple Music token not configured');
      return [];
    }

    try {
      const response = await axios.get(`${this.appleMusicBaseUrl}/catalog/us/search`, {
        params: {
          term: query,
          types: 'songs',
          limit
        },
        headers: {
          'Authorization': `Bearer ${this.appleMusicToken}`
        }
      });

      return response.data.results.songs?.data.map(song => ({
        id: song.id,
        title: song.attributes.name,
        artist: song.attributes.artistName,
        album: song.attributes.albumName,
        albumArt: song.attributes.artwork?.url.replace('{w}x{h}', '300x300'),
        duration: Math.floor(song.attributes.durationInMillis / 1000),
        previewUrl: song.attributes.previews?.[0]?.url,
        appleMusicUrl: song.attributes.url,
        source: 'apple'
      })) || [];
    } catch (error) {
      console.error('Error searching Apple Music:', error);
      return [];
    }
  }

  /**
   * Search for songs on both platforms
   * @param {string} query - Search query
   * @param {number} limit - Number of results per platform
   * @returns {Promise<Array>} Combined array of song objects
   */
  async searchAll(query, limit = 10) {
    try {
      const [spotifyResults, appleMusicResults] = await Promise.all([
        this.searchSpotify(query, limit),
        this.searchAppleMusic(query, limit)
      ]);

      // Combine and deduplicate results based on title and artist
      const allResults = [...spotifyResults, ...appleMusicResults];
      const uniqueResults = [];
      const seen = new Set();

      for (const song of allResults) {
        const key = `${song.title.toLowerCase()}-${song.artist.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueResults.push(song);
        }
      }

      return uniqueResults;
    } catch (error) {
      console.error('Error searching all platforms:', error);
      return [];
    }
  }

  /**
   * Fetch lyrics for a song
   * @param {string} artist - Artist name
   * @param {string} title - Song title
   * @returns {Promise<string>} Lyrics text
   */
  async getLyrics(artist, title) {
    try {
      // Try lyrics.ovh API
      const response = await axios.get(`${this.lyricsApiUrl}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);

      if (response.data && response.data.lyrics) {
        return response.data.lyrics;
      }

      // If lyrics.ovh doesn't have it, return mock lyrics for demo
      return this.generateMockLyrics(title, artist);
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      // Return mock lyrics as fallback
      return this.generateMockLyrics(title, artist);
    }
  }

  /**
   * Generate mock lyrics for demonstration
   * @param {string} title - Song title
   * @param {string} artist - Artist name
   * @returns {string} Mock lyrics
   */
  generateMockLyrics(title, artist) {
    return `[Verse 1]
This is a sample lyric for "${title}"
By ${artist}
Learn languages through music
With SpeakEasy

[Chorus]
Singing helps you remember
Words and phrases flow together
Music makes learning better
SpeakEasy forever

[Verse 2]
Practice pronunciation
Through musical expression
Build your confidence
With every session

[Note: Full lyrics not available. This is a demo version.]`;
  }

  /**
   * Analyze lyrics and create a custom lesson
   * @param {string} lyrics - Song lyrics
   * @param {string} targetLanguage - Language to learn
   * @param {string} userLevel - User's proficiency level
   * @returns {Promise<Object>} Lesson object with vocabulary, phrases, and exercises
   */
  async createLyricsLesson(lyrics, targetLanguage, userLevel) {
    try {
      const prompt = `Analyze these song lyrics in ${targetLanguage} and create an interactive language learning lesson.

Lyrics:
${lyrics}

User level: ${userLevel}

Create a lesson with:
1. Key vocabulary words from the lyrics (10-15 words)
2. Important phrases or idioms
3. Grammar points demonstrated in the lyrics
4. Cultural context or expressions
5. Practice exercises (fill in the blank, multiple choice)

Format as JSON:
{
  "vocabulary": [
    {
      "word": "palabra",
      "translation": "word",
      "context": "sentence from lyrics containing the word",
      "difficulty": "beginner/intermediate/advanced"
    }
  ],
  "phrases": [
    {
      "phrase": "phrase from lyrics",
      "meaning": "meaning or translation",
      "usage": "how it's typically used"
    }
  ],
  "grammarPoints": [
    {
      "concept": "grammar concept",
      "explanation": "brief explanation",
      "examples": ["example 1", "example 2"]
    }
  ],
  "culturalNotes": "cultural context or interesting facts",
  "exercises": [
    {
      "type": "fill_in_blank",
      "question": "lyric with _____ for missing word",
      "answer": "correct word",
      "options": ["option1", "option2", "option3", "option4"]
    }
  ]
}`;

      const response = await LLMService.generateResponse(prompt);

      // Try to parse JSON response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing lesson:', parseError);
      }

      // Fallback to basic structure
      return {
        vocabulary: [],
        phrases: [],
        grammarPoints: [],
        culturalNotes: response,
        exercises: []
      };
    } catch (error) {
      console.error('Error creating lyrics lesson:', error);
      throw error;
    }
  }

  /**
   * Get detailed track information from Spotify
   * @param {string} trackId - Spotify track ID
   * @returns {Promise<Object>} Track details
   */
  async getSpotifyTrackDetails(trackId) {
    try {
      const token = await this.getSpotifyAccessToken();

      const response = await axios.get(`${this.spotifyBaseUrl}/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        id: response.data.id,
        title: response.data.name,
        artist: response.data.artists.map(a => a.name).join(', '),
        album: response.data.album.name,
        albumArt: response.data.album.images[0]?.url,
        duration: Math.floor(response.data.duration_ms / 1000),
        previewUrl: response.data.preview_url,
        spotifyUrl: response.data.external_urls.spotify,
        popularity: response.data.popularity,
        releaseDate: response.data.album.release_date
      };
    } catch (error) {
      console.error('Error getting Spotify track details:', error);
      throw error;
    }
  }

  /**
   * Configure API credentials
   * @param {Object} config - Configuration object
   */
  setConfig(config) {
    if (config.appleMusicToken) {
      this.appleMusicToken = config.appleMusicToken;
    }
    if (config.spotifyClientId) {
      this.spotifyClientId = config.spotifyClientId;
    }
    if (config.spotifyClientSecret) {
      this.spotifyClientSecret = config.spotifyClientSecret;
    }
  }

  /**
   * Check if music services are configured
   * @returns {Object} Status of each service
   */
  getConfigStatus() {
    return {
      spotify: !!(this.spotifyClientId && this.spotifyClientSecret),
      appleMusic: !!this.appleMusicToken
    };
  }
}

export default new MusicService();
