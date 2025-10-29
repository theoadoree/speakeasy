# XP Integration Guide

This guide explains how to integrate XP earning across all tabs in the SpeakEasy app.

## Overview

The XP system has been fully implemented with:
- **XPService** ([src/services/xp.js](src/services/xp.js)) - Calculates XP for all activities
- **LeagueService** ([src/services/league.js](src/services/league.js)) - Frontend service for league API
- **League Backend** ([backend/league-routes.js](backend/league-routes.js)) - Backend API for weekly leagues
- **AppContext Integration** - XP methods available via `useApp()` hook

## Available XP Methods in AppContext

```javascript
const {
  awardXP,           // Award XP for any activity type
  awardQuizXP,       // Award XP for quiz completion
  awardLessonXP,     // Award XP for lesson completion
  userProgress,      // Current user progress (includes XP)
  leagueData,        // User's league data and rank
  refreshLeagueData, // Refresh league data from backend
  getLeagueRankings  // Get rankings for user's league
} = useApp();
```

## XP Rewards Reference

All XP values are defined in `XP_REWARDS` constant in [src/services/xp.js](src/services/xp.js:13-66):

### Lessons & Quizzes
- `LESSON_START`: 5 XP
- `LESSON_COMPLETE`: 50 XP
- `LESSON_PERFECT_SCORE`: 25 XP bonus
- `QUIZ_ATTEMPT`: 10 XP
- `QUIZ_PASS`: 30 XP
- `QUIZ_PERFECT`: 50 XP
- `QUIZ_QUESTION_CORRECT`: 5 XP each

### Practice & Conversation
- `CONVERSATION_MESSAGE`: 2 XP per message
- `CONVERSATION_SESSION`: 15 XP per 5 minutes
- `VOICE_PRACTICE`: 10 XP

### Review
- `REVIEW_LESSON_GENERATE`: 10 XP
- `REVIEW_LESSON_COMPLETE`: 35 XP
- `REVIEW_EXERCISE_CORRECT`: 5 XP each

### Music/Lyrics
- `LYRICS_LESSON_START`: 5 XP
- `LYRICS_LESSON_COMPLETE`: 30 XP
- `SONG_TRANSLATION`: 20 XP

### Other Activities
- `READING_COMPLETE`: 20 XP
- `PRONUNCIATION_PRACTICE`: 10 XP
- `ACCENT_SESSION_COMPLETE`: 25 XP
- `CUSTOM_LESSON_CREATE`: 15 XP
- `CUSTOM_LESSON_COMPLETE`: 25 XP

### Streaks & Achievements
- `DAILY_LOGIN`: 10 XP
- `STREAK_MILESTONE_5`: 25 XP
- `STREAK_MILESTONE_10`: 50 XP
- `STREAK_MILESTONE_30`: 100 XP
- `FIRST_LESSON`: 50 XP bonus

## Integration Examples by Screen

### 1. Learn Tab (HomeScreen.js)

```javascript
import { useApp } from '../contexts/AppContext';

export default function HomeScreen() {
  const { awardXP } = useApp();

  const handleGenerateStory = async () => {
    // ... generate story logic ...

    // Award XP for generating content
    await awardXP('LESSON_START');
  };

  const handleReadStory = async () => {
    // ... reading logic ...

    // Award XP for completing reading
    await awardXP('READING_COMPLETE');
  };

  return (
    // ... UI ...
  );
}
```

### 2. Curriculum Tab (CurriculumScreen.js & LessonDetailScreen.js)

```javascript
import { useApp } from '../contexts/AppContext';

export default function LessonDetailScreen() {
  const { awardLessonXP, awardXP } = useApp();

  const handleStartLesson = async () => {
    // ... start lesson logic ...
    await awardXP('LESSON_START');
  };

  const handleCompleteLesson = async (timeSpent, quizScore) => {
    // ... complete lesson logic ...

    // Award comprehensive lesson XP (includes quiz bonus)
    const result = await awardLessonXP(
      timeSpent,      // Time in seconds
      quizScore,      // Quiz score 0-100
      isFirstTime     // Boolean
    );

    if (result.success) {
      console.log('XP earned:', result.total);
      console.log('Breakdown:', result.breakdown);
    }
  };
}
```

### 3. Quiz Screen (QuizScreen.js)

```javascript
import { useApp } from '../contexts/AppContext';

export default function QuizScreen() {
  const { awardQuizXP } = useApp();

  const handleSubmitQuiz = async (answers) => {
    const score = calculateScore(answers);
    const correctCount = answers.filter(a => a.correct).length;
    const totalQuestions = answers.length;

    // Award quiz XP with detailed breakdown
    const result = await awardQuizXP(score, totalQuestions, correctCount);

    if (result.success) {
      // Show XP breakdown to user
      Alert.alert(
        'Quiz Complete!',
        `You earned ${result.total} XP!\n${result.breakdown.map(b => `\n${b.reason}: +${b.xp} XP`).join('')}`
      );
    }
  };
}
```

### 4. Practice Tab (PracticeScreen.js)

```javascript
import { useApp } from '../contexts/AppContext';

export default function PracticeScreen() {
  const { awardXP } = useApp();
  const [sessionStart, setSessionStart] = useState(null);
  const [messageCount, setMessageCount] = useState(0);

  const handleSendMessage = async (message) => {
    // ... send message logic ...
    setMessageCount(prev => prev + 1);

    // Award XP per message
    await awardXP('CONVERSATION_MESSAGE');
  };

  const handleEndSession = async () => {
    const duration = (Date.now() - sessionStart) / 1000; // seconds

    // Calculate session bonuses
    const sessionBonuses = Math.floor(duration / 300); // per 5 minutes
    for (let i = 0; i < sessionBonuses; i++) {
      await awardXP('CONVERSATION_SESSION');
    }
  };
}
```

### 5. Review Tab (ReviewScreen.js)

```javascript
import { useApp } from '../contexts/AppContext';

export default function ReviewScreen() {
  const { awardXP, generateReviewLesson, markReviewLessonComplete } = useApp();

  const handleGenerateLesson = async (focusType) => {
    const result = await generateReviewLesson(focusType);

    if (result.success) {
      // Award XP for generating review
      await awardXP('REVIEW_LESSON_GENERATE');
    }
  };

  const handleCompleteReview = async (exerciseCount, correctCount, score) => {
    // Award review XP
    await awardXP('REVIEW_LESSON_COMPLETE');

    // Award per correct answer
    for (let i = 0; i < correctCount; i++) {
      await awardXP('REVIEW_EXERCISE_CORRECT');
    }

    // Perfect bonus
    if (score === 100) {
      await awardXP('REVIEW_EXERCISE_CORRECT', { bonus: 25 });
    }
  };
}
```

### 6. Accent Tutor Tab (AccentTutorScreen.js)

```javascript
import { useApp } from '../contexts/AppContext';

export default function AccentTutorScreen() {
  const { awardXP } = useApp();

  const handlePracticePronunciation = async () => {
    // ... pronunciation practice logic ...
    await awardXP('PRONUNCIATION_PRACTICE');
  };

  const handleCompleteSession = async () => {
    // ... session complete logic ...
    await awardXP('ACCENT_SESSION_COMPLETE');
  };
}
```

### 7. Music Tab (MusicScreen.js & LyricsLessonScreen.js)

```javascript
import { useApp } from '../contexts/AppContext';

export default function LyricsLessonScreen() {
  const { awardXP } = useApp();

  const handleStartLesson = async () => {
    await awardXP('LYRICS_LESSON_START');
  };

  const handleCompleteLesson = async () => {
    await awardXP('LYRICS_LESSON_COMPLETE');
  };

  const handleTranslateSong = async () => {
    await awardXP('SONG_TRANSLATION');
  };
}
```

### 8. Custom Lessons Tab (LessonsScreen.js & CustomLessonsScreen.js)

```javascript
import { useApp } from '../contexts/AppContext';

export default function CustomLessonsScreen() {
  const { awardXP } = useApp();

  const handleCreateLesson = async (lessonData) => {
    // ... create lesson logic ...
    await awardXP('CUSTOM_LESSON_CREATE');
  };

  const handleCompleteLesson = async (lessonId) => {
    // ... complete lesson logic ...
    await awardXP('CUSTOM_LESSON_COMPLETE');
  };
}
```

### 9. Settings Tab - Daily Login Bonus

```javascript
import { useApp } from '../contexts/AppContext';
import StorageService from '../utils/storage';

export default function SettingsScreen() {
  const { awardXP, userProgress } = useApp();

  useEffect(() => {
    checkDailyLogin();
  }, []);

  const checkDailyLogin = async () => {
    const isFirstToday = await StorageService.isFirstLoginToday();

    if (isFirstToday) {
      const result = await awardXP('DAILY_LOGIN');

      // Check for streak milestones
      const streak = userProgress?.streak || 0;
      if (streak === 5) await awardXP('STREAK_MILESTONE_5');
      if (streak === 10) await awardXP('STREAK_MILESTONE_10');
      if (streak === 30) await awardXP('STREAK_MILESTONE_30');
      if (streak === 100) await awardXP('STREAK_MILESTONE_100');

      // Save login timestamp
      await StorageService.saveLastLogin();
    }
  };
}
```

## Displaying XP and Level

```javascript
import { useApp } from '../contexts/AppContext';
import XPService from '../services/xp';

export default function ProfileCard() {
  const { userProgress } = useApp();

  const levelInfo = XPService.getLevelFromXP(userProgress?.xp || 0);

  return (
    <View>
      <Text>Level {levelInfo.level}</Text>
      <Text>{levelInfo.xpInCurrentLevel} / {levelInfo.xpForNextLevel} XP</Text>
      <ProgressBar progress={levelInfo.progressPercent / 100} />
      <Text>{XPService.formatXP(userProgress?.xp)} Total XP</Text>
    </View>
  );
}
```

## Backend Setup

The backend needs to be running for league features to work:

```bash
cd backend
npm install
npm start  # Starts on port 8080
```

### Backend Endpoints

- `POST /api/leagues/join` - Join league system
- `POST /api/leagues/xp` - Update user XP
- `GET /api/leagues/rankings/:userId` - Get league rankings
- `GET /api/leagues/user/:userId` - Get user league data
- `GET /api/leagues/leaderboard/global` - Get global leaderboard

### Weekly Reset

The backend includes a weekly reset endpoint (for admin/cron):

```bash
curl -X POST http://localhost:8080/api/leagues/reset-week
```

This should be called every Monday at midnight to:
- Archive weekly scores
- Promote top 10 users
- Demote bottom 10 users
- Reset weekly XP to 0

## League Tiers

Users are automatically placed in leagues based on total XP:

- 🥉 **Bronze League**: 0 - 499 XP
- 🥈 **Silver League**: 500 - 1,499 XP
- 🥇 **Gold League**: 1,500 - 3,499 XP
- 💎 **Platinum League**: 3,500 - 6,999 XP
- 💠 **Diamond League**: 7,000 - 14,999 XP
- 👑 **Master League**: 15,000+ XP

## Testing XP System

To test the XP system:

1. **Award XP manually**:
```javascript
const { awardXP } = useApp();
await awardXP('LESSON_COMPLETE'); // Awards 50 XP
```

2. **Check current XP**:
```javascript
const { userProgress } = useApp();
console.log('Current XP:', userProgress?.xp);
```

3. **View league data**:
```javascript
const { leagueData, getLeagueRankings } = useApp();
console.log('League:', leagueData);
const rankings = await getLeagueRankings();
console.log('Rankings:', rankings);
```

4. **Reset progress (for testing)**:
```javascript
import StorageService from '../utils/storage';
await StorageService.saveUserProgress({ xp: 0, streak: 0 });
```

## Best Practices

1. **Always await XP calls**: XP updates are async
2. **Award XP after action completes**: Don't award before saving data
3. **Use appropriate activity types**: Check XP_REWARDS for all available types
4. **Show XP feedback**: Display XP earned to motivate users
5. **Track XP breakdown**: Use quiz/lesson XP methods for detailed feedback
6. **Handle errors gracefully**: XP failures shouldn't break app flow

## Next Steps

1. Update all screens listed above to award XP
2. Add XP displays to UI (profile cards, tab bars, etc.)
3. Implement weekly league notifications
4. Set up backend cron job for weekly resets
5. Add XP animations and celebratory feedback
6. Create achievement system based on XP milestones

## Questions?

Check these files for implementation details:
- [src/services/xp.js](src/services/xp.js) - XP calculation logic
- [src/services/league.js](src/services/league.js) - League API client
- [src/contexts/AppContext.js](src/contexts/AppContext.js) - XP context methods
- [backend/league-routes.js](backend/league-routes.js) - Backend league API
