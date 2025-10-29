/**
 * NotificationService - Handle push notifications and reminders
 *
 * Features:
 * - Request notification permissions
 * - Schedule daily reminders (noon and 6pm)
 * - Check user login status before sending
 * - Rotate through catchy reminder messages
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import StorageService from '../utils/storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// 14 catchy reminder messages to minimize repetition
const REMINDER_MESSAGES = [
  {
    title: "¡Hola! Time to practice! 👋",
    body: "Your daily language adventure awaits. Just 10 minutes today!"
  },
  {
    title: "Language skills need love! 💙",
    body: "Don't let your streak break! Quick practice session?"
  },
  {
    title: "Your brain is ready! 🧠✨",
    body: "Studies show this is the perfect time to learn. Let's go!"
  },
  {
    title: "Missing you! 🎯",
    body: "Your target language is waiting. Ready to level up?"
  },
  {
    title: "Quick question... 🤔",
    body: "Can you say 'I'm getting better every day' in your target language?"
  },
  {
    title: "Streak alert! 🔥",
    body: "Keep that learning fire burning. Just 5 minutes can make a difference!"
  },
  {
    title: "Your future self will thank you! 🌟",
    body: "Every lesson brings you closer to fluency. Start now?"
  },
  {
    title: "Fun fact! 📚",
    body: "People who practice daily learn 5x faster. Be one of them today!"
  },
  {
    title: "Let's make today count! 💪",
    body: "Small progress every day = big results. Ready for your lesson?"
  },
  {
    title: "Your language buddy misses you! 🤗",
    body: "Practice makes progress. Let's chat in your target language!"
  },
  {
    title: "Challenge time! 🎮",
    body: "Can you beat yesterday's score? Try an accent practice session!"
  },
  {
    title: "Music + Language = Magic! 🎵",
    body: "Learn through your favorite songs. Discover new lyrics today!"
  },
  {
    title: "Don't lose your progress! ⚡",
    body: "You've come so far! Keep the momentum with a quick practice."
  },
  {
    title: "Level up time! 🚀",
    body: "Your XP is calling. Complete a lesson and climb the leagues!"
  }
];

class NotificationService {
  constructor() {
    this.lastMessageIndex = -1;
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Request notification permissions
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Configure channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('daily-reminders', {
          name: 'Daily Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#007AFF',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Get a random reminder message (avoid repeating the last one)
   * @returns {Object} Reminder message with title and body
   */
  getRandomReminder() {
    let index;
    do {
      index = Math.floor(Math.random() * REMINDER_MESSAGES.length);
    } while (index === this.lastMessageIndex && REMINDER_MESSAGES.length > 1);

    this.lastMessageIndex = index;
    return REMINDER_MESSAGES[index];
  }

  /**
   * Check if user has logged in today
   * @returns {Promise<boolean>}
   */
  async hasLoggedInToday() {
    try {
      const progress = await StorageService.getUserProgress();
      const today = new Date().toDateString();
      const lastActivity = progress.lastActivityDate;

      return lastActivity === today;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  /**
   * Schedule daily reminders at noon and 6pm
   * @returns {Promise<void>}
   */
  async scheduleDailyReminders() {
    try {
      // Cancel any existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Get current date/time
      const now = new Date();

      // Schedule noon reminder (12:00 PM)
      const noonReminder = this.getRandomReminder();
      const noonTrigger = {
        hour: 12,
        minute: 0,
        repeats: true
      };

      await Notifications.scheduleNotificationAsync({
        identifier: 'daily-noon-reminder',
        content: {
          title: noonReminder.title,
          body: noonReminder.body,
          sound: 'default',
          data: { type: 'daily-reminder', time: 'noon' },
        },
        trigger: noonTrigger,
      });

      // Schedule 6pm reminder (18:00)
      const eveningReminder = this.getRandomReminder();
      const eveningTrigger = {
        hour: 18,
        minute: 0,
        repeats: true
      };

      await Notifications.scheduleNotificationAsync({
        identifier: 'daily-evening-reminder',
        content: {
          title: eveningReminder.title,
          body: eveningReminder.body,
          sound: 'default',
          data: { type: 'daily-reminder', time: 'evening' },
        },
        trigger: eveningTrigger,
      });

      console.log('Daily reminders scheduled successfully');

      // Save reminder preferences
      await StorageService.saveReminderPreferences({
        enabled: true,
        noonEnabled: true,
        eveningEnabled: true,
        lastScheduled: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  }

  /**
   * Cancel all scheduled reminders
   * @returns {Promise<void>}
   */
  async cancelReminders() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All reminders canceled');

      await StorageService.saveReminderPreferences({
        enabled: false,
        lastScheduled: null
      });
    } catch (error) {
      console.error('Error canceling reminders:', error);
    }
  }

  /**
   * Get all scheduled notifications
   * @returns {Promise<Array>}
   */
  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Send an immediate test notification
   * @returns {Promise<void>}
   */
  async sendTestNotification() {
    try {
      const reminder = this.getRandomReminder();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          sound: 'default',
          data: { type: 'test' },
        },
        trigger: null, // Send immediately
      });

      console.log('Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  /**
   * Set up notification listeners
   * @param {Function} onNotificationReceived - Callback when notification is received
   * @param {Function} onNotificationTapped - Callback when notification is tapped
   */
  setupListeners(onNotificationReceived, onNotificationTapped) {
    // Listener for when a notification is received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      }
    );

    // Listener for when user taps on a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        if (onNotificationTapped) {
          onNotificationTapped(response);
        }
      }
    );
  }

  /**
   * Clean up notification listeners
   */
  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
  }

  /**
   * Update reminder messages with fresh ones (rotates messages)
   * @returns {Promise<void>}
   */
  async refreshReminders() {
    try {
      // Get current preferences
      const prefs = await StorageService.getReminderPreferences();

      if (prefs.enabled) {
        // Reschedule with new messages
        await this.scheduleDailyReminders();
        console.log('Reminders refreshed with new messages');
      }
    } catch (error) {
      console.error('Error refreshing reminders:', error);
    }
  }

  /**
   * Check if reminders are enabled
   * @returns {Promise<boolean>}
   */
  async areRemindersEnabled() {
    try {
      const prefs = await StorageService.getReminderPreferences();
      return prefs.enabled || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle notification tap - navigate to appropriate screen
   * @param {Object} notification - Notification response
   * @param {Object} navigation - React Navigation object
   */
  handleNotificationTap(notification, navigation) {
    try {
      const data = notification.notification.request.content.data;

      if (data.type === 'daily-reminder') {
        // Navigate to home screen or practice screen
        if (navigation) {
          navigation.navigate('Main', { screen: 'Home' });
        }
      }
    } catch (error) {
      console.error('Error handling notification tap:', error);
    }
  }
}

export default new NotificationService();
