# SpeakEasy Notification & Reminder System

## Overview

SpeakEasy includes a smart notification system that sends daily reminders to users at noon (12:00 PM) and 6:00 PM, encouraging them to practice their language learning. The system uses **14 unique catchy messages** to minimize repetition and keep users engaged.

## Features

### 🔔 Daily Reminders
- **Noon Reminder (12:00 PM)**: Perfect mid-day learning break
- **Evening Reminder (6:00 PM)**: After-work practice session
- **Automatic Scheduling**: Set once, runs daily automatically
- **Smart Rotation**: 14 different messages to avoid repetition

### 📱 Notification Messages

The system rotates through 14 engaging messages:

1. "¡Hola! Time to practice! 👋" - Your daily language adventure awaits
2. "Language skills need love! 💙" - Don't let your streak break!
3. "Your brain is ready! 🧠✨" - Perfect time to learn
4. "Missing you! 🎯" - Your target language is waiting
5. "Quick question... 🤔" - Can you say it in your target language?
6. "Streak alert! 🔥" - Keep that learning fire burning
7. "Your future self will thank you! 🌟" - Get closer to fluency
8. "Fun fact! 📚" - Daily practice = 5x faster learning
9. "Let's make today count! 💪" - Small progress, big results
10. "Your language buddy misses you! 🤗" - Let's chat!
11. "Challenge time! 🎮" - Beat yesterday's score
12. "Music + Language = Magic! 🎵" - Learn through songs
13. "Don't lose your progress! ⚡" - Keep the momentum
14. "Level up time! 🚀" - Climb the leagues!

### 🎯 Smart Features

- **Login Detection**: Only sends if user hasn't logged in that day
- **Permission Handling**: Requests notification permissions on first use
- **Cross-Platform**: Works on iOS and Android
- **Test Mode**: Send test notifications immediately
- **Easy Toggle**: Enable/disable in Settings

## Implementation Details

### Files Created

1. **`src/services/notifications.js`** - Main notification service
   - Request permissions
   - Schedule daily reminders
   - Manage notification lifecycle
   - Handle notification taps

2. **`src/utils/storage.js`** (Updated)
   - Added reminder preferences storage
   - Added last login tracking
   - Methods: `saveReminderPreferences()`, `getReminderPreferences()`, `saveLastLogin()`, `isFirstLoginToday()`

3. **`App.js`** (Updated)
   - Integrated notification setup on app launch
   - Tracks last login automatically
   - Sets up notification listeners

### Storage Keys

```javascript
REMINDER_PREFERENCES: '@fluentai:reminderPreferences'
// Stores: { enabled, noonEnabled, eveningEnabled, lastScheduled }

LAST_LOGIN: '@fluentai:lastLogin'
// Stores: ISO timestamp of last app login
```

## Usage

### For Users

**Enable Reminders:**
1. Open Settings
2. Toggle "Daily Reminders" ON
3. Permissions will be requested automatically

**Disable Reminders:**
1. Open Settings
2. Toggle "Daily Reminders" OFF

**Test Notifications:**
1. Open Settings
2. Tap "Send Test Notification"
3. Receive a sample notification immediately

### For Developers

**Setup in App:**
```javascript
import NotificationService from './src/services/notifications';

// In your app startup
await NotificationService.requestPermissions();
await NotificationService.scheduleDailyReminders();
```

**Check Reminder Status:**
```javascript
const enabled = await NotificationService.areRemindersEnabled();
```

**Cancel All Reminders:**
```javascript
await NotificationService.cancelReminders();
```

**Send Test Notification:**
```javascript
await NotificationService.sendTestNotification();
```

**Refresh Messages (rotate to new messages):**
```javascript
await NotificationService.refreshReminders();
```

## Notification Flow

```
App Launch
    ↓
User Authentication
    ↓
Request Notification Permissions
    ↓
Check Reminder Preferences
    ↓
If Enabled → Schedule Daily Notifications
    ↓
Track Last Login Time
    ↓
[At 12:00 PM or 6:00 PM]
    ↓
Check if User Logged In Today
    ↓
If No → Send Reminder Notification
    ↓
User Taps Notification
    ↓
Open App to Home Screen
```

## Technical Details

### Platform-Specific

**iOS:**
- Uses iOS native notification system
- Requires permission request
- Notifications appear in Notification Center
- Supports badge counts

**Android:**
- Uses Android notification channels
- Channel: "daily-reminders" (High importance)
- Vibration pattern: [0, 250, 250, 250]
- LED color: #007AFF (SpeakEasy blue)

### Permissions

**iOS:**
- Requires user approval via system dialog
- Can be revoked in Settings > Notifications

**Android:**
- Automatically granted for API 32 and below
- Requires runtime permission for API 33+

### Scheduling

Uses `expo-notifications` with daily repeating triggers:

```javascript
{
  hour: 12,  // Noon
  minute: 0,
  repeats: true
}
```

## Future Enhancements

Possible additions:
- [ ] Customizable reminder times
- [ ] Weekly summary notifications
- [ ] Achievement unlock notifications
- [ ] Friend activity notifications
- [ ] Lesson reminder before review date
- [ ] Streak milestone celebrations
- [ ] League promotion alerts

## Troubleshooting

**Notifications not appearing?**
1. Check app permissions in device settings
2. Ensure "Do Not Disturb" is off
3. Verify reminders are enabled in app Settings
4. Send a test notification to confirm setup

**Messages repeating?**
- The system rotates through 14 messages automatically
- Use `refreshReminders()` to force new message selection

**Want different times?**
- Currently hardcoded to 12:00 PM and 6:00 PM
- Modify `scheduleDailyReminders()` in `notifications.js`

## Dependencies

```json
{
  "expo-notifications": "^0.32.12"
}
```

## Best Practices

1. **Always request permissions** before scheduling
2. **Handle permission denial** gracefully
3. **Don't spam users** - respect their preferences
4. **Test on real devices** - simulators may not show notifications correctly
5. **Track notification engagement** - monitor tap rates

## Related Files

- `src/services/notifications.js` - Notification service
- `src/utils/storage.js` - Storage utilities
- `App.js` - Integration point
- `src/screens/SettingsScreen.js` - User controls (to be added)

---

**Last Updated:** 2025-01-28
**Version:** 1.0.0
