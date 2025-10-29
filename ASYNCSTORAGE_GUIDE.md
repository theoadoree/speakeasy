# AsyncStorage Guide

## What is AsyncStorage?

**AsyncStorage** is React Native's built-in, simple, persistent key-value storage system.

### Key Characteristics

- **Asynchronous**: All operations return Promises
- **Persistent**: Data survives app restarts
- **Local-only**: Stored on device, not cloud
- **Unencrypted**: Don't store passwords or sensitive data
- **String-based**: Everything stored as strings (use JSON.stringify/parse for objects)
- **Global**: Accessible from anywhere in the app
- **Simple**: Easy to use key-value API

### Think of it as:
- **Like localStorage** but for React Native
- **Like a database** but much simpler (no SQL, no schemas)
- **Like cookies** but bigger and more permanent

## Your App's Storage Keys

Currently storing (from [storage.js](src/utils/storage.js:3-17)):

```javascript
@fluentai:authToken          // JWT authentication token
@fluentai:userData           // User account data (email, name, id)
@fluentai:userProfile        // Language profile (level, interests, target language)
@fluentai:llmConfig          // LLM settings (baseURL, model)
@fluentai:contentLibrary     // Saved stories and imported content
@fluentai:conversationHistory // Chat practice history
@fluentai:onboardingComplete // Boolean flag
@fluentai:themeMode          // 'light', 'dark', or 'system'
@fluentai:musicLibrary       // Music content for lessons
@fluentai:musicLessons       // Music-based lessons
@fluentai:userProgress       // XP, streak, achievements, stats
@fluentai:customLessons      // Custom lesson data
@fluentai:musicConfig        // Music API credentials
```

## How to View AsyncStorage

### Method 1: Built-in Debug Screen ✨ (Recommended)

**I just added this for you!**

1. **Open any screen** (Home, Practice, or Lessons)
2. **Click your username** in the upper right corner
3. **Select "Developer Tools"** from the menu
4. **Browse all storage keys** with:
   - Key names
   - Data sizes
   - Preview of values
   - Type information (Object, Array, String, etc.)
5. **Tap any item** to view full content
6. **Delete individual items** or clear all storage
7. **Export to console** for backup/debugging

### Method 2: React Native Debugger

**Install:**
```bash
brew install --cask react-native-debugger
```

**Use:**
1. Start your app with debugging enabled (Cmd+D → Debug)
2. Open React Native Debugger
3. Console tab → Type:
   ```javascript
   // View all keys
   AsyncStorage.getAllKeys().then(keys => console.log(keys))

   // View specific value
   AsyncStorage.getItem('@fluentai:userProfile').then(data =>
     console.log(JSON.parse(data))
   )

   // View everything
   AsyncStorage.getAllKeys().then(keys =>
     AsyncStorage.multiGet(keys).then(stores =>
       console.log(Object.fromEntries(stores))
     )
   )
   ```

### Method 3: Flipper (Facebook's Debugger)

**Install:**
```bash
brew install --cask flipper
```

**Use:**
1. Run your app
2. Open Flipper
3. Navigate to: **Plugins → Databases → AsyncStorage**
4. Nice table view with search and filtering

### Method 4: Command Line (iOS Simulator)

**View storage file directly:**
```bash
# Find your app's data directory
xcrun simctl get_app_container booted [your.app.bundle.id] data

# Navigate to AsyncStorage
cd ~/Library/Developer/CoreSimulator/Devices/[DEVICE_ID]/data/Containers/Data/Application/[APP_ID]/Documents/RCTAsyncLocalStorage_V1

# View database
sqlite3 manifest.db "SELECT * FROM catalystLocalStorage;"
```

### Method 5: Programmatic Access (Code)

Add this to any component:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// View all data
const viewAllStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const items = await AsyncStorage.multiGet(keys);
  console.log('Storage:', items);
};

// View specific key
const viewKey = async (key) => {
  const value = await AsyncStorage.getItem(key);
  console.log(key, ':', JSON.parse(value));
};
```

## AsyncStorage API Reference

### Basic Operations

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// SAVE (Set)
await AsyncStorage.setItem('@myKey', 'string value');
await AsyncStorage.setItem('@myObject', JSON.stringify({ name: 'John' }));

// READ (Get)
const value = await AsyncStorage.getItem('@myKey');
const obj = JSON.parse(await AsyncStorage.getItem('@myObject'));

// DELETE (Remove)
await AsyncStorage.removeItem('@myKey');

// CLEAR ALL
await AsyncStorage.clear(); // ⚠️ Deletes everything!

// GET ALL KEYS
const keys = await AsyncStorage.getAllKeys();

// GET MULTIPLE
const values = await AsyncStorage.multiGet(['@key1', '@key2']);

// SET MULTIPLE
await AsyncStorage.multiSet([
  ['@key1', 'value1'],
  ['@key2', 'value2']
]);

// REMOVE MULTIPLE
await AsyncStorage.multiRemove(['@key1', '@key2']);
```

### Your App's Storage Service

You've wrapped AsyncStorage in [StorageService](src/utils/storage.js) with helper methods:

```javascript
import StorageService from './src/utils/storage';

// User profile
await StorageService.saveUserProfile(profile);
const profile = await StorageService.getUserProfile();

// Content
await StorageService.saveContent(content);
const library = await StorageService.getContentLibrary();
await StorageService.deleteContent(contentId);

// Theme
await StorageService.saveThemeMode('dark');
const theme = await StorageService.getThemeMode();

// Progress
await StorageService.addXP(50);
const progress = await StorageService.getUserProgress();

// And more...
```

## Storage Limits

### iOS
- **No official limit** but recommended < 6MB
- Stored in SQLite database
- Location: App's Documents directory
- Backed up to iCloud (unless you disable it)

### Android
- **No official limit** but recommended < 6MB
- Stored in SQLite database
- Location: `/data/data/[package]/databases/RCTAsyncLocalStorage_V1`
- Not backed up by default

### Performance Tips
- Keep individual values < 2MB
- Don't store images/large files (use filesystem instead)
- Batch operations with multiGet/multiSet
- Cache frequently accessed data in memory

## When to Use AsyncStorage

### ✅ Good For:
- User preferences (theme, language)
- Simple app state
- Small JSON objects
- Temporary caching
- Session data
- Settings
- Flags and toggles

### ❌ Bad For:
- Sensitive data (use Keychain/Keystore instead)
- Large files (images, videos)
- Complex queries (use SQLite/Realm instead)
- Real-time data (use state management)
- High-frequency writes (performance issues)

## Alternatives to AsyncStorage

### 1. **Expo SecureStore** (for sensitive data)
```bash
npx expo install expo-secure-store
```
- Encrypted storage
- iOS Keychain / Android Keystore
- Perfect for tokens, passwords
- **Smaller limit** (2KB on Android)

### 2. **SQLite** (for complex data)
```bash
npx expo install expo-sqlite
```
- SQL database
- Complex queries
- Large datasets
- Relationships between data

### 3. **Realm** (NoSQL database)
```bash
npm install realm
```
- Object-oriented database
- Offline-first
- Real-time sync
- Great for complex apps

### 4. **MMKV** (faster alternative)
```bash
npm install react-native-mmkv
```
- 30x faster than AsyncStorage
- Synchronous API
- Encryption support
- Drop-in replacement

### 5. **Zustand + Persist** (state + storage)
```bash
npm install zustand
```
- State management
- Auto-persist to AsyncStorage
- TypeScript support
- Simpler than Redux

### 6. **Cloud Storage**
- Firebase Firestore
- AWS Amplify DataStore
- Supabase
- Backend database + API

## Migration Example (AsyncStorage → MMKV)

If you want faster storage:

```javascript
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

// Synchronous API (faster!)
storage.set('user.name', 'John');
const name = storage.getString('user.name');

// Store objects
storage.set('user.profile', JSON.stringify(profile));
```

## Debugging Tips

### Check if data exists
```javascript
const value = await AsyncStorage.getItem('@myKey');
if (value === null) {
  console.log('Key does not exist');
} else {
  console.log('Value:', value);
}
```

### Log all storage on app start
```javascript
useEffect(() => {
  AsyncStorage.getAllKeys().then(keys =>
    AsyncStorage.multiGet(keys).then(stores => {
      console.log('=== STORAGE ===');
      stores.forEach(([key, value]) => {
        console.log(key, ':', value?.substring(0, 100));
      });
    })
  );
}, []);
```

### Clear storage in development
```javascript
// Add to your debug menu
const clearStorage = async () => {
  await AsyncStorage.clear();
  console.log('Storage cleared');
  // Restart app or reload
};
```

### Monitor storage size
```javascript
const getStorageSize = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const items = await AsyncStorage.multiGet(keys);
  const totalSize = items.reduce((acc, [key, value]) => {
    return acc + (value?.length || 0);
  }, 0);
  console.log(`Storage size: ${(totalSize / 1024).toFixed(2)} KB`);
};
```

## Common Issues & Solutions

### Issue 1: Data not persisting
**Cause:** Forgetting to await
```javascript
// ❌ Wrong
AsyncStorage.setItem('@key', 'value'); // Not awaited!

// ✅ Correct
await AsyncStorage.setItem('@key', 'value');
```

### Issue 2: Getting null unexpectedly
**Cause:** Key doesn't exist or was cleared
```javascript
// ✅ Add null check
const value = await AsyncStorage.getItem('@key');
if (value === null) {
  // Use default value
  return defaultValue;
}
```

### Issue 3: Can't store objects
**Cause:** AsyncStorage only stores strings
```javascript
// ❌ Wrong
await AsyncStorage.setItem('@user', { name: 'John' }); // [object Object]

// ✅ Correct
await AsyncStorage.setItem('@user', JSON.stringify({ name: 'John' }));
const user = JSON.parse(await AsyncStorage.getItem('@user'));
```

### Issue 4: Storage cleared unexpectedly
**Causes:**
- App uninstalled
- Called `AsyncStorage.clear()`
- iOS/Android cleared app data
- Simulator reset

**Solution:** Implement cloud backup or sync

## Best Practices

### 1. Use a wrapper service ✅
You already do this with `StorageService.js`!

### 2. Namespace your keys
```javascript
// ✅ Good
const KEYS = {
  USER_PROFILE: '@fluentai:userProfile',
  THEME: '@fluentai:theme'
};

// ❌ Bad
'profile'  // Could conflict with other packages
```

### 3. Handle errors
```javascript
try {
  await AsyncStorage.setItem('@key', 'value');
} catch (error) {
  console.error('Storage error:', error);
  // Show user-friendly message
}
```

### 4. Provide defaults
```javascript
async getUserProfile() {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}
```

### 5. Batch operations
```javascript
// ❌ Slow (multiple async calls)
await AsyncStorage.setItem('@key1', 'value1');
await AsyncStorage.setItem('@key2', 'value2');
await AsyncStorage.setItem('@key3', 'value3');

// ✅ Fast (single async call)
await AsyncStorage.multiSet([
  ['@key1', 'value1'],
  ['@key2', 'value2'],
  ['@key3', 'value3']
]);
```

### 6. Don't block UI
```javascript
// ✅ Load asynchronously
useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  const data = await AsyncStorage.getItem('@key');
  setState(data);
};
```

## Security Considerations

### ⚠️ AsyncStorage is NOT encrypted

**Don't store:**
- Passwords (plaintext)
- API secrets
- Credit card numbers
- Social security numbers
- Private keys

**Do store:**
- User preferences
- UI state
- Cache data
- Non-sensitive user data
- Public tokens (with expiration)

**For sensitive data, use:**
```javascript
import * as SecureStore from 'expo-secure-store';

// Save securely
await SecureStore.setItemAsync('secure-token', token);

// Retrieve
const token = await SecureStore.getItemAsync('secure-token');
```

## Useful Development Commands

```javascript
// In your app, add these debug helpers

// 1. View all storage
const debugStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const items = await AsyncStorage.multiGet(keys);
  console.table(items);
};

// 2. Search storage
const searchStorage = async (searchTerm) => {
  const keys = await AsyncStorage.getAllKeys();
  const matching = keys.filter(key => key.includes(searchTerm));
  const items = await AsyncStorage.multiGet(matching);
  console.log(items);
};

// 3. Storage stats
const storageStats = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const items = await AsyncStorage.multiGet(keys);
  const sizes = items.map(([k, v]) => ({ key: k, size: v?.length || 0 }));
  const total = sizes.reduce((acc, { size }) => acc + size, 0);
  console.log({
    totalKeys: keys.length,
    totalSize: `${(total / 1024).toFixed(2)} KB`,
    largest: sizes.sort((a, b) => b.size - a.size)[0]
  });
};

// 4. Export for backup
const exportStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const items = await AsyncStorage.multiGet(keys);
  const data = Object.fromEntries(items);
  console.log(JSON.stringify(data, null, 2));
  // Copy from console and save to file
};

// 5. Import from backup
const importStorage = async (backupData) => {
  const entries = Object.entries(backupData);
  await AsyncStorage.multiSet(entries);
};
```

## Summary

- **AsyncStorage** = Simple, persistent key-value storage
- **View it** = Use the new Debug Screen I created (UserMenu → Developer Tools)
- **Location** = Stored locally on device in SQLite database
- **Good for** = User preferences, settings, small data
- **Bad for** = Sensitive data, large files, complex queries
- **Alternatives** = SecureStore, SQLite, Realm, MMKV, Cloud storage

**To view your data right now:**
1. Tap your username (upper right)
2. Select "Developer Tools"
3. Browse all your AsyncStorage data! 🎉
