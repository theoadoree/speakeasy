# Level Assessment System

## Overview

The SpeakEasy app now automatically assigns users a language proficiency level after their first conversation practice session. This creates a more natural onboarding experience where users start chatting immediately rather than self-selecting a level they may not accurately know.

## How It Works

### 1. Onboarding Flow (Modified)

**Previous Flow:**
1. Name
2. Native Language
3. Target Language
4. **Level Selection** (A1-C2)
5. Interests

**New Flow:**
1. Name
2. Native Language
3. Target Language
4. Interests
5. → Proceed to Practice Screen with `assessmentPending: true`

The level selection step has been removed. Users now have their profile created with:
- `level: 'unknown'`
- `assessmentPending: true`

### 2. First Conversation Assessment

When a user with `assessmentPending: true` starts practicing:

1. **Welcome Message** is tailored to explain the assessment:
   > "Hi [Name]! Welcome to SpeakEasy! 🎉 Let's have a quick conversation in [Language] so I can understand your current level. Don't worry - just relax and chat with me naturally..."

2. **Visual Indicator** appears showing "Level Assessment" card instead of lesson card

3. **Conversation Tracking** begins - the system monitors user messages

4. **Assessment Trigger** - After minimum 3 user messages (configurable), the system:
   - Collects all user messages from the conversation
   - Sends them to the backend assessment API
   - Receives level evaluation (A1-C2) with feedback

5. **Level Assignment** - The system:
   - Updates user profile with assessed level
   - Sets `assessmentPending: false`
   - Stores assessment date and feedback
   - Displays results to the user

6. **Feedback Display** - User sees:
   - Alert with their assessed level
   - Description of the level (e.g., "A2: Elementary - Basic conversations")
   - Personalized feedback on strengths and areas to improve
   - Encouragement message

### 3. Assessment API

**Endpoint:** `POST /api/assessment/evaluate`

**Request:**
```json
{
  "responses": ["user message 1", "user message 2", "..."],
  "targetLanguage": "Spanish"
}
```

**Response:**
```json
{
  "assessment": {
    "level": "beginner/intermediate/advanced",
    "feedback": "Based on your responses...",
    "strengths": ["Good vocabulary", "Clear pronunciation"],
    "areasToImprove": ["Grammar", "Complex sentences"]
  }
}
```

The backend uses OpenAI GPT-4o-mini to analyze the conversation and determine proficiency level.

## Files Modified

### New Files
- **`src/services/assessment.js`** - Assessment service with level evaluation logic
  - `evaluateLevel()` - Sends conversation to backend API
  - `mapToLevel()` - Normalizes level formats to CEFR (A1-C2)
  - `needsAssessment()` - Checks if user needs assessment
  - `getLevelDescription()` - Gets friendly level descriptions
  - `getMinimumExchanges()` - Returns minimum messages needed (3)

### Modified Files

1. **`src/screens/OnboardingScreen.js`**
   - Removed level selection step (Step 4)
   - Reduced progress dots from 5 to 4
   - Set default level to 'unknown' with `assessmentPending: true`
   - Updated button text from "Get Started!" to "Start Learning!"

2. **`src/screens/PracticeScreen.js`**
   - Added `AssessmentService` import
   - Added `assessmentTriggered` state to prevent duplicate assessments
   - Added `checkAndTriggerAssessment()` function
   - Added `performAssessment()` function
   - Updated welcome message to explain assessment for new users
   - Added visual "Level Assessment" card when `assessmentPending: true`
   - Assessment results shown via Alert and in-conversation message
   - TTS support for assessment results announcement

3. **`src/contexts/AppContext.js`**
   - Already had proper `updateUserProfile()` function that saves to storage
   - No changes needed

## User Experience

### First-Time User Journey

1. **Onboarding** (1-2 minutes)
   - Enter name → Select native language → Select target language → Choose interests
   - No need to guess their level!

2. **First Practice Session** (3-5 minutes)
   - Opens Practice Screen
   - Sees: "Level Assessment - Chat with me to determine your Spanish level"
   - AI welcomes them and explains the assessment
   - User has natural conversation (minimum 3 exchanges)

3. **Automatic Assessment**
   - After 3+ messages, AI says: "Let me evaluate your language level... 🤔"
   - Backend analyzes conversation quality
   - Results displayed: "Great job! 🎉 You've been assessed at A2: Elementary"
   - Alert shows detailed feedback

4. **Personalized Learning**
   - All future lessons tailored to assessed level
   - User profile shows their level in settings
   - Can track progress from this baseline

## Configuration

Minimum exchanges for assessment can be adjusted in `AssessmentService`:

```javascript
getMinimumExchanges() {
  return 3; // Change this number as needed
}
```

## Fallback Behavior

If assessment fails (API error, network issue):
- User defaults to A1 (Beginner) level
- Message: "Let's start with beginner level (A1) for now. We can adjust as we continue practicing together!"
- Assessment can be manually triggered later or re-done

## Benefits

1. **More Accurate** - Actual conversation analysis vs. self-assessment
2. **Better UX** - No intimidating CEFR level selection during onboarding
3. **Natural Flow** - Users start chatting immediately
4. **Engagement** - First interaction is meaningful practice, not form-filling
5. **Adaptable** - System learns from real user performance

## Future Enhancements

Potential improvements:
- Re-assessment after X lessons to track progress
- Mid-session mini-assessments for level adjustments
- Specific skill assessments (vocabulary, grammar, listening, speaking)
- Assessment history tracking
- Manual re-assessment option in settings
- Multi-dimensional level (e.g., B1 grammar, A2 vocabulary)

## Testing the Feature

To test the assessment flow:

1. Clear app data or use new account
2. Complete onboarding (skip level selection - it's removed)
3. Go to Practice tab
4. See "Level Assessment" card
5. Have at least 3 conversational exchanges
6. Watch for "Let me evaluate..." message
7. Receive level assessment results
8. Verify profile updated in settings

## Technical Notes

- Assessment is one-time per user (unless manually reset)
- `assessmentPending` flag persists in AsyncStorage
- Assessment results stored in user profile
- No duplicate assessments - `assessmentTriggered` state prevents re-evaluation
- Backend handles all AI analysis - app just displays results
- Works with both voice and text input modes
