/**
 * League Service - Frontend service for interacting with league backend
 *
 * Handles all league-related API calls including joining leagues,
 * updating XP, fetching rankings, and managing weekly competitions.
 */

import axios from 'axios';
import { API_BASE_URL } from './auth';

class LeagueService {
  constructor() {
    this.baseURL = API_BASE_URL || 'http://localhost:8080';
    this.cache = {
      rankings: null,
      userData: null,
      lastFetch: null
    };
    this.CACHE_DURATION = 30000; // 30 seconds
  }

  /**
   * Join the league system
   * @param {Object} userInfo - User information
   * @returns {Promise<Object>} League data
   */
  async joinLeague(userInfo) {
    try {
      const response = await axios.post(`${this.baseURL}/api/leagues/join`, {
        userId: userInfo.userId || userInfo.id,
        username: userInfo.username || userInfo.name,
        totalXP: userInfo.totalXP || 0,
        avatar: userInfo.avatar || '👤'
      });

      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Join league error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Update user's XP
   * @param {string} userId - User ID
   * @param {number} xpAmount - Amount of XP to add
   * @param {string} activity - Activity description
   * @returns {Promise<Object>} Updated user data
   */
  async updateXP(userId, xpAmount, activity) {
    try {
      const response = await axios.post(`${this.baseURL}/api/leagues/xp`, {
        userId,
        xpAmount,
        activity
      });

      // Invalidate cache
      this.cache.lastFetch = null;

      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Update XP error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Get rankings for user's league
   * @param {string} userId - User ID
   * @param {boolean} forceRefresh - Force refresh cache
   * @returns {Promise<Object>} Rankings data
   */
  async getRankings(userId, forceRefresh = false) {
    try {
      // Check cache
      if (!forceRefresh && this.cache.rankings && this.cache.lastFetch) {
        const age = Date.now() - this.cache.lastFetch;
        if (age < this.CACHE_DURATION) {
          return { success: true, ...this.cache.rankings, cached: true };
        }
      }

      const response = await axios.get(`${this.baseURL}/api/leagues/rankings/${userId}`);

      // Update cache
      this.cache.rankings = response.data;
      this.cache.lastFetch = Date.now();

      return {
        success: true,
        ...response.data,
        cached: false
      };
    } catch (error) {
      console.error('Get rankings error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Get user's league data and stats
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User league data
   */
  async getUserData(userId) {
    try {
      const response = await axios.get(`${this.baseURL}/api/leagues/user/${userId}`);

      // Update cache
      this.cache.userData = response.data;

      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Get user data error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Get global leaderboard
   * @param {number} limit - Number of users to fetch
   * @returns {Promise<Object>} Global leaderboard
   */
  async getGlobalLeaderboard(limit = 100) {
    try {
      const response = await axios.get(`${this.baseURL}/api/leagues/leaderboard/global`, {
        params: { limit }
      });

      return {
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Get global leaderboard error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Calculate time until week ends
   * @param {string} weekEndsAt - ISO timestamp
   * @returns {Object} Time breakdown
   */
  getTimeUntilWeekEnd(weekEndsAt) {
    const now = new Date();
    const end = new Date(weekEndsAt);
    const diff = end - now;

    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        expired: true
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return {
      days,
      hours,
      minutes,
      expired: false,
      formatted: `${days}d ${hours}h ${minutes}m`
    };
  }

  /**
   * Get league color
   * @param {string} leagueId - League ID
   * @returns {string} Hex color
   */
  getLeagueColor(leagueId) {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF',
      master: '#9D00FF'
    };
    return colors[leagueId?.toLowerCase()] || '#999';
  }

  /**
   * Get league icon
   * @param {string} leagueId - League ID
   * @returns {string} Emoji icon
   */
  getLeagueIcon(leagueId) {
    const icons = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
      diamond: '💠',
      master: '👑'
    };
    return icons[leagueId?.toLowerCase()] || '🏆';
  }

  /**
   * Format XP for display
   * @param {number} xp - XP amount
   * @returns {string} Formatted XP
   */
  formatXP(xp) {
    if (xp >= 1000000) {
      return `${(xp / 1000000).toFixed(1)}M`;
    } else if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}K`;
    }
    return xp.toString();
  }

  /**
   * Get rank color based on position
   * @param {number} rank - User's rank
   * @returns {string} Hex color
   */
  getRankColor(rank) {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    if (rank <= 10) return '#4CAF50'; // Green (promotion zone)
    if (rank >= 41) return '#FF6B6B'; // Red (demotion zone)
    return '#666'; // Default
  }

  /**
   * Check if in promotion zone
   * @param {number} rank - User's rank
   * @returns {boolean} True if in promotion zone
   */
  isPromotionZone(rank) {
    return rank <= 10 && rank > 0;
  }

  /**
   * Check if in demotion zone
   * @param {number} rank - User's rank
   * @returns {boolean} True if in demotion zone
   */
  isDemotionZone(rank) {
    return rank >= 41 && rank <= 50;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = {
      rankings: null,
      userData: null,
      lastFetch: null
    };
  }
}

export default new LeagueService();
