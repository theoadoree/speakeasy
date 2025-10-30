// Web shim for expo-notifications
const Notifications = {
  requestPermissionsAsync: async () => {
    return {
      status: 'granted',
      granted: true,
      canAskAgain: false,
    };
  },

  scheduleNotificationAsync: async (content) => {
    console.log('Notification scheduled (web):', content);
    return 'notification-id';
  },

  cancelAllScheduledNotificationsAsync: async () => {
    console.log('All notifications cancelled (web)');
  },

  addNotificationReceivedListener: (listener) => {
    return { remove: () => {} };
  },

  addNotificationResponseReceivedListener: (listener) => {
    return { remove: () => {} };
  },
};

export default Notifications;
