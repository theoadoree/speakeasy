/**
 * AnalyticsService - Track notification and app engagement metrics
 *
 * Features:
 * - Track notification sends
 * - Track notification taps/opens
 * - Calculate engagement rates per message
 * - Identify best performing messages
 * - Track learning activity patterns
 */

import StorageService from '../utils/storage';

class AnalyticsService {
  constructor() {
    this.sessionStart = new Date();
  }

  /**
   * Track when a notification is sent
   * @param {number} messageIndex - Index of the message sent
   * @param {string} messageTitle - Title of the notification
   * @param {string} time - Time of day ('noon' or 'evening')
   * @returns {Promise<void>}
   */
  async trackNotificationSent(messageIndex, messageTitle, time = 'unknown') {
    try {
      const analytics = await StorageService.getNotificationAnalytics();

      if (!analytics.messages) {
        analytics.messages = {};
      }

      const key = `message_${messageIndex}`;

      if (!analytics.messages[key]) {
        analytics.messages[key] = {
          index: messageIndex,
          title: messageTitle,
          sent: 0,
          opened: 0,
          engagementRate: 0,
          lastSent: null,
          timesSentByPeriod: {
            noon: 0,
            evening: 0
          }
        };
      }

      analytics.messages[key].sent += 1;
      analytics.messages[key].lastSent = new Date().toISOString();
      analytics.messages[key].timesSentByPeriod[time] += 1;

      // Update total counts
      if (!analytics.totals) {
        analytics.totals = { sent: 0, opened: 0, engagementRate: 0 };
      }
      analytics.totals.sent += 1;

      await StorageService.saveNotificationAnalytics(analytics);

      console.log(`[Analytics] Notification sent: ${messageTitle} (${time})`);
    } catch (error) {
      console.error('[Analytics] Error tracking notification sent:', error);
    }
  }

  /**
   * Track when a notification is tapped/opened
   * @param {number} messageIndex - Index of the message that was opened
   * @param {string} messageTitle - Title of the notification
   * @returns {Promise<void>}
   */
  async trackNotificationOpened(messageIndex, messageTitle) {
    try {
      const analytics = await StorageService.getNotificationAnalytics();

      if (!analytics.messages) {
        analytics.messages = {};
      }

      const key = `message_${messageIndex}`;

      if (!analytics.messages[key]) {
        // Initialize if it doesn't exist (shouldn't happen, but defensive)
        analytics.messages[key] = {
          index: messageIndex,
          title: messageTitle,
          sent: 0,
          opened: 0,
          engagementRate: 0,
          lastOpened: null
        };
      }

      analytics.messages[key].opened += 1;
      analytics.messages[key].lastOpened = new Date().toISOString();

      // Calculate engagement rate
      const sent = analytics.messages[key].sent;
      const opened = analytics.messages[key].opened;
      analytics.messages[key].engagementRate = sent > 0 ? (opened / sent) * 100 : 0;

      // Update total counts
      if (!analytics.totals) {
        analytics.totals = { sent: 0, opened: 0, engagementRate: 0 };
      }
      analytics.totals.opened += 1;
      analytics.totals.engagementRate = analytics.totals.sent > 0
        ? (analytics.totals.opened / analytics.totals.sent) * 100
        : 0;

      await StorageService.saveNotificationAnalytics(analytics);

      console.log(`[Analytics] Notification opened: ${messageTitle}`);
    } catch (error) {
      console.error('[Analytics] Error tracking notification opened:', error);
    }
  }

  /**
   * Get the best performing messages (highest engagement rate)
   * @param {number} limit - Number of top messages to return
   * @returns {Promise<Array>}
   */
  async getBestMessages(limit = 5) {
    try {
      const analytics = await StorageService.getNotificationAnalytics();

      if (!analytics.messages) {
        return [];
      }

      const messages = Object.values(analytics.messages)
        .filter(m => m.sent > 0) // Only include messages that have been sent
        .sort((a, b) => b.engagementRate - a.engagementRate)
        .slice(0, limit);

      return messages;
    } catch (error) {
      console.error('[Analytics] Error getting best messages:', error);
      return [];
    }
  }

  /**
   * Get the worst performing messages (lowest engagement rate)
   * @param {number} limit - Number of bottom messages to return
   * @returns {Promise<Array>}
   */
  async getWorstMessages(limit = 5) {
    try {
      const analytics = await StorageService.getNotificationAnalytics();

      if (!analytics.messages) {
        return [];
      }

      const messages = Object.values(analytics.messages)
        .filter(m => m.sent > 0) // Only include messages that have been sent
        .sort((a, b) => a.engagementRate - b.engagementRate)
        .slice(0, limit);

      return messages;
    } catch (error) {
      console.error('[Analytics] Error getting worst messages:', error);
      return [];
    }
  }

  /**
   * Get overall notification analytics summary
   * @returns {Promise<Object>}
   */
  async getAnalyticsSummary() {
    try {
      const analytics = await StorageService.getNotificationAnalytics();

      const messages = Object.values(analytics.messages || {});
      const sentCount = analytics.totals?.sent || 0;
      const openedCount = analytics.totals?.opened || 0;
      const engagementRate = analytics.totals?.engagementRate || 0;

      // Calculate best time to send
      let noonTotal = 0;
      let eveningTotal = 0;
      let noonOpened = 0;
      let eveningOpened = 0;

      messages.forEach(msg => {
        if (msg.timesSentByPeriod) {
          noonTotal += msg.timesSentByPeriod.noon || 0;
          eveningTotal += msg.timesSentByPeriod.evening || 0;
        }
      });

      const noonEngagement = noonTotal > 0 ? (noonOpened / noonTotal) * 100 : 0;
      const eveningEngagement = eveningTotal > 0 ? (eveningOpened / eveningTotal) * 100 : 0;

      return {
        totalSent: sentCount,
        totalOpened: openedCount,
        engagementRate: engagementRate.toFixed(2),
        messagesTracked: messages.length,
        bestTime: eveningEngagement > noonEngagement ? 'evening' : 'noon',
        noonEngagement: noonEngagement.toFixed(2),
        eveningEngagement: eveningEngagement.toFixed(2),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('[Analytics] Error getting analytics summary:', error);
      return {
        totalSent: 0,
        totalOpened: 0,
        engagementRate: '0.00',
        messagesTracked: 0,
        bestTime: 'unknown',
        noonEngagement: '0.00',
        eveningEngagement: '0.00'
      };
    }
  }

  /**
   * Track app session duration
   * @returns {Promise<void>}
   */
  async trackSessionEnd() {
    try {
      const sessionEnd = new Date();
      const duration = (sessionEnd - this.sessionStart) / 1000; // seconds

      const analytics = await StorageService.getNotificationAnalytics();

      if (!analytics.sessions) {
        analytics.sessions = [];
      }

      analytics.sessions.push({
        start: this.sessionStart.toISOString(),
        end: sessionEnd.toISOString(),
        duration: Math.floor(duration)
      });

      // Keep only last 30 sessions to avoid bloat
      if (analytics.sessions.length > 30) {
        analytics.sessions = analytics.sessions.slice(-30);
      }

      await StorageService.saveNotificationAnalytics(analytics);

      console.log(`[Analytics] Session ended: ${Math.floor(duration)}s`);
    } catch (error) {
      console.error('[Analytics] Error tracking session end:', error);
    }
  }

  /**
   * Get average session duration
   * @returns {Promise<number>} Average duration in seconds
   */
  async getAverageSessionDuration() {
    try {
      const analytics = await StorageService.getNotificationAnalytics();

      if (!analytics.sessions || analytics.sessions.length === 0) {
        return 0;
      }

      const totalDuration = analytics.sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      return Math.floor(totalDuration / analytics.sessions.length);
    } catch (error) {
      console.error('[Analytics] Error getting average session duration:', error);
      return 0;
    }
  }

  /**
   * Clear all analytics data
   * @returns {Promise<void>}
   */
  async clearAnalytics() {
    try {
      await StorageService.clearNotificationAnalytics();
      console.log('[Analytics] Analytics data cleared');
    } catch (error) {
      console.error('[Analytics] Error clearing analytics:', error);
    }
  }

  /**
   * Export analytics data for review
   * @returns {Promise<Object>}
   */
  async exportAnalytics() {
    try {
      const analytics = await StorageService.getNotificationAnalytics();
      const summary = await this.getAnalyticsSummary();
      const bestMessages = await this.getBestMessages(5);
      const worstMessages = await this.getWorstMessages(5);

      return {
        summary,
        bestMessages,
        worstMessages,
        rawData: analytics,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('[Analytics] Error exporting analytics:', error);
      return null;
    }
  }

  /**
   * Get engagement insights and recommendations
   * @returns {Promise<Object>}
   */
  async getInsights() {
    try {
      const summary = await this.getAnalyticsSummary();
      const bestMessages = await this.getBestMessages(3);
      const worstMessages = await this.getWorstMessages(3);

      const insights = {
        overall: '',
        recommendations: [],
        highlights: []
      };

      // Overall assessment
      const rate = parseFloat(summary.engagementRate);
      if (rate >= 50) {
        insights.overall = 'Excellent! Your notifications are highly engaging.';
      } else if (rate >= 30) {
        insights.overall = 'Good engagement. There\'s room for improvement.';
      } else if (rate >= 10) {
        insights.overall = 'Moderate engagement. Consider optimizing your messages.';
      } else {
        insights.overall = 'Low engagement. Time to refresh your notification strategy.';
      }

      // Recommendations
      if (rate < 30) {
        insights.recommendations.push('Try using more messages from the top performers');
        insights.recommendations.push('Consider removing or rewording low-performing messages');
      }

      if (summary.bestTime === 'evening') {
        insights.recommendations.push('Evening notifications perform better - consider focusing on that time');
      } else if (summary.bestTime === 'noon') {
        insights.recommendations.push('Noon notifications perform better - consider focusing on that time');
      }

      if (summary.totalSent < 10) {
        insights.recommendations.push('Need more data - keep notifications enabled for better insights');
      }

      // Highlights
      if (bestMessages.length > 0) {
        insights.highlights.push(`Top message: "${bestMessages[0].title}" with ${bestMessages[0].engagementRate.toFixed(1)}% engagement`);
      }

      return insights;
    } catch (error) {
      console.error('[Analytics] Error getting insights:', error);
      return {
        overall: 'Unable to generate insights',
        recommendations: [],
        highlights: []
      };
    }
  }
}

export default new AnalyticsService();
