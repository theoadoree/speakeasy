# UserMenu Component - Settings Dropdown

## Overview
The UserMenu component displays the user's name underlined in the upper right corner of screens. When clicked, it reveals a comprehensive settings dropdown menu with various options.

## Visual Design
- **Username Display**: Underlined text in the app's primary color (theme-aware)
- **Position**: Upper right corner (absolute positioning at top: 60, right: 20)
- **Menu Style**: Modern dropdown card with rounded corners and shadow
- **Theme Support**: Fully integrated with light/dark mode theming

## Menu Options

### 1. **Change Language** 🌐
- **Icon**: `language`
- **Color**: Blue (#3B82F6)
- **Function**: Switch target language
- **Subtitle**: Shows current target language (e.g., "Spanish")
- **Options**: Spanish, French, German, Italian, Portuguese, Japanese, Korean, Mandarin

### 2. **Theme** 🌙/☀️
- **Icon**: `moon` (dark mode) or `sunny` (light mode)
- **Color**: Amber (#F59E0B)
- **Function**: Toggle between light, dark, and system default themes
- **Subtitle**: Shows current theme mode
- **Options**:
  - Light Mode
  - Dark Mode
  - System Default

### 3. **Learning Level** 🎓
- **Icon**: `school`
- **Color**: Green (#10B981)
- **Function**: Adjust proficiency level
- **Subtitle**: Shows current level (e.g., "Level A1")
- **Options**: A1-C2 (Beginner to Proficient)

### 4. **Daily Goal** 🎯
- **Icon**: `target`
- **Color**: Purple (#8B5CF6)
- **Function**: Set daily learning targets
- **Subtitle**: "Set your daily target"
- **Status**: Coming soon (placeholder)

### 5. **Notifications** 🔔
- **Icon**: `notifications`
- **Color**: Red (#EF4444)
- **Function**: Manage notification preferences
- **Subtitle**: "Manage reminders"
- **Options**:
  - Enable Daily Reminders
  - Disable All Notifications

### 6. **Account Settings** 👤
- **Icon**: `person`
- **Color**: Cyan (#06B6D4)
- **Function**: Navigate to full settings screen
- **Subtitle**: "Edit profile & preferences"
- **Action**: Navigates to Settings tab

### 7. **Privacy** 🛡️
- **Icon**: `shield-checkmark`
- **Color**: Slate (#64748B)
- **Function**: View privacy information
- **Subtitle**: "Data & security settings"
- **Info**: Shows local storage notice

### 8. **Help & Support** ❓
- **Icon**: `help-circle`
- **Color**: Indigo (#6366F1)
- **Function**: Access help resources
- **Subtitle**: "Get assistance"
- **Options**:
  - View Tutorial
  - FAQ
  - Contact Support

### 9. **About** ℹ️
- **Icon**: `information-circle`
- **Color**: Gray (#94A3B8)
- **Function**: Show app information
- **Subtitle**: "App info & version"
- **Displays**: Version 1.0.0, copyright info

### 10. **Logout** 🚪
- **Icon**: `log-out`
- **Color**: Red (#DC2626)
- **Style**: Danger styling (red text)
- **Function**: Sign out of account
- **Subtitle**: "Sign out of your account"
- **Confirmation**: Shows alert before logout

## Technical Implementation

### Files Modified
1. **Created**: `/src/components/UserMenu.js` - Main component
2. **Updated**:
   - `/src/screens/LessonsScreen.js` - Added UserMenu
   - `/src/screens/HomeScreen.js` - Added UserMenu
   - `/src/screens/PracticeScreen.js` - Added UserMenu

### Context Integration
- **AuthContext**: Access to user data and logout function
- **AppContext**: Access to userProfile and updateUserProfile
- **ThemeContext**: Theme toggling and current theme state

### Props
- `navigation` (optional): React Navigation prop for screen navigation

### Theming
The UserMenu is fully theme-aware and responds to:
- Light/Dark mode changes
- System theme preferences
- Custom theme colors from ThemeContext

### State Management
All settings changes are persisted using:
- **Theme**: StorageService.saveThemeMode()
- **Profile**: AppContext.updateUserProfile()
- **Auth**: AuthContext logout()

## Usage Example

```javascript
import UserMenu from '../components/UserMenu';

function MyScreen({ navigation }) {
  return (
    <View>
      <UserMenu navigation={navigation} />
      {/* Rest of your screen content */}
    </View>
  );
}
```

## Screens with UserMenu

The UserMenu has been added to:
- ✅ HomeScreen (Learn tab)
- ✅ LessonsScreen (Custom Lessons tab)
- ✅ PracticeScreen (Practice tab)

## Future Enhancements

Potential additions:
- Daily goal setting with actual tracking
- Notification scheduling
- Tutorial/onboarding replay
- Contact support integration
- Version update checker
- Achievement badges display
- Streak counter
- XP progress display

## Design Philosophy

The UserMenu follows these principles:
1. **Accessibility**: All settings in one convenient location
2. **Discoverability**: Underlined username hints at interactivity
3. **Consistency**: Same menu available across all main screens
4. **Theme-aware**: Seamlessly adapts to light/dark modes
5. **Progressive disclosure**: Advanced settings behind primary options
6. **Visual feedback**: Color-coded icons for easy recognition
7. **Confirmation dialogs**: For destructive actions (logout)
8. **Context preservation**: Returns to same screen after menu actions
