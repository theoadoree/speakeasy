# Language Selection Flow

## Overview

The onboarding screen now implements a smart language selection flow that:
1. **First** asks for the user's native language
2. **Then** shows available learning languages filtered by OpenAI availability
3. Prevents users from selecting their native language as a learning language

## Implementation Details

### Native Language Selection (Step 2)

**Available Languages (29 options):**
- Major languages: English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Mandarin Chinese, Arabic, Russian, Hindi
- European: Dutch, Swedish, Norwegian, Danish, Polish, Turkish, Greek, Hebrew
- Asian: Vietnamese, Thai, Indonesian, Filipino, Bengali, Urdu, Farsi
- African: Swahili
- Other (catch-all for languages not listed)

### Learning Language Selection (Step 3)

**OpenAI-Supported Languages (25 options):**
The learning languages are filtered to include only those that OpenAI GPT-4 supports well for language learning:
- Spanish, French, German, Italian, Portuguese
- Japanese, Korean, Mandarin Chinese, Arabic, Russian
- Hindi, Dutch, Swedish, Norwegian, Danish
- Polish, Turkish, Greek, Hebrew, Vietnamese
- Thai, Indonesian, Filipino, Swahili, Bengali

**Smart Filtering:**
- Automatically excludes the user's native language
- Shows count of available languages: "Powered by OpenAI • X languages available"
- Displays warning if no languages are available (e.g., if user selects "Other" as native)

## User Flow

```
Step 1: Name
   ↓
Step 2: Native Language Selection
   ↓
Step 3: Learning Language Selection (filtered)
   ↓
Step 4: Current Level
   ↓
Step 5: Interests
   ↓
Complete → Main App
```

## Technical Implementation

### Key Code Sections

**Language Constants:**
```javascript
const OPENAI_SUPPORTED_LANGUAGES = [
  'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Japanese', 'Korean', 'Mandarin Chinese', 'Arabic', 'Russian',
  // ... 25 total languages
];

const NATIVE_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  // ... 29 total languages including "Other"
];
```

**Dynamic Filtering:**
```javascript
const availableLearningLanguages = useMemo(() => {
  return OPENAI_SUPPORTED_LANGUAGES.filter(lang =>
    lang !== nativeLanguage && lang !== 'Other'
  );
}, [nativeLanguage]);
```

**Validation:**
```javascript
const canContinue = () => {
  switch (step) {
    case 2: return nativeLanguage.length > 0;
    case 3: return targetLanguage.length > 0;
    // ...
  }
};
```

## UI/UX Features

### Step 2: Native Language
- Title: "What's your native language? 🌍"
- Subtitle: "This helps us tailor lessons to you"
- Grid of selectable language buttons
- Selected language highlighted in blue

### Step 3: Learning Language
- Title: "Which language do you want to learn? 📚"
- Subtitle: "Powered by OpenAI • X languages available"
- Filtered grid of available languages
- Warning message if no languages available
- Native language automatically excluded

### Visual Design
- Button-style selectors (not dropdowns) for better mobile UX
- Scrollable grid layout with wrap
- Blue highlight (#007AFF) for selected items
- Disabled state for Continue button until selection made
- 5-step progress indicator at top

## Benefits

1. **OpenAI Integration**: Only shows languages that OpenAI GPT-4 supports well
2. **Smart Filtering**: Prevents illogical selections (native = learning)
3. **Clear Feedback**: Shows count of available languages
4. **User-Friendly**: Large touch targets, clear visual feedback
5. **Scalable**: Easy to add/remove languages from constants

## Future Enhancements

- Add language search/filter for large lists
- Show language flags/icons
- Add "Popular" tag for common languages
- Suggest languages based on user's location
- Add "I'm not sure" option for level selection
