/**
 * League Routes - Handles weekly league management and rankings
 *
 * Manages user participation in competitive weekly leagues with
 * automatic promotion/demotion and weekly resets.
 */

const express = require('express');
const router = express.Router();

// In-memory storage (replace with database in production)
const leagueData = {
  users: new Map(), // userId -> user league data
  leagues: new Map(), // leagueId -> league data
  weeklySnapshots: [] // Historical weekly data
};

// League tiers
const LEAGUES = {
  BRONZE: { id: 'bronze', name: 'Bronze League', minXP: 0, color: '#CD7F32', icon: '🥉' },
  SILVER: { id: 'silver', name: 'Silver League', minXP: 500, color: '#C0C0C0', icon: '🥈' },
  GOLD: { id: 'gold', name: 'Gold League', minXP: 1500, color: '#FFD700', icon: '🥇' },
  PLATINUM: { id: 'platinum', name: 'Platinum League', minXP: 3500, color: '#E5E4E2', icon: '💎' },
  DIAMOND: { id: 'diamond', name: 'Diamond League', minXP: 7000, color: '#B9F2FF', icon: '💠' },
  MASTER: { id: 'master', name: 'Master League', minXP: 15000, color: '#9D00FF', icon: '👑' }
};

const LEAGUE_SIZE = 50; // Number of users per league instance

/**
 * Initialize league system
 */
function initializeLeagues() {
  Object.values(LEAGUES).forEach(league => {
    if (!leagueData.leagues.has(league.id)) {
      leagueData.leagues.set(league.id, {
        ...league,
        instances: [] // Multiple instances of same tier
      });
    }
  });
}

initializeLeagues();

/**
 * Get league tier for user based on total XP
 */
function getLeagueTierForXP(totalXP) {
  const tiers = Object.values(LEAGUES).reverse(); // Start from highest
  for (const tier of tiers) {
    if (totalXP >= tier.minXP) {
      return tier;
    }
  }
  return LEAGUES.BRONZE;
}

/**
 * Get current week identifier
 */
function getCurrentWeek() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNumber}`;
}

/**
 * Get start of current week
 */
function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(now.setDate(diff)).setHours(0, 0, 0, 0);
}

/**
 * POST /api/leagues/join
 * Join or rejoin the league system
 */
router.post('/join', (req, res) => {
  try {
    const { userId, username, totalXP = 0, avatar } = req.body;

    if (!userId || !username) {
      return res.status(400).json({ error: 'userId and username required' });
    }

    const currentWeek = getCurrentWeek();
    const tier = getLeagueTierForXP(totalXP);

    // Check if user already exists
    let userData = leagueData.users.get(userId);

    if (!userData) {
      // New user - create league data
      userData = {
        userId,
        username,
        avatar,
        totalXP,
        weeklyXP: 0,
        currentLeague: tier.id,
        leagueInstanceId: null,
        rank: null,
        joinedWeek: currentWeek,
        lastActiveWeek: currentWeek,
        history: []
      };
    } else {
      // Existing user - check if week changed
      if (userData.lastActiveWeek !== currentWeek) {
        // New week - reset weekly XP
        userData.weeklyXP = 0;
        userData.lastActiveWeek = currentWeek;
      }
      userData.totalXP = totalXP;
    }

    // Assign to league instance if needed
    if (!userData.leagueInstanceId) {
      userData.leagueInstanceId = assignToLeagueInstance(tier.id, userId);
    }

    leagueData.users.set(userId, userData);

    res.json({
      success: true,
      userData,
      tier
    });
  } catch (error) {
    console.error('Join league error:', error);
    res.status(500).json({ error: 'Failed to join league', details: error.message });
  }
});

/**
 * POST /api/leagues/xp
 * Update user's XP (both total and weekly)
 */
router.post('/xp', (req, res) => {
  try {
    const { userId, xpAmount, activity } = req.body;

    if (!userId || !xpAmount) {
      return res.status(400).json({ error: 'userId and xpAmount required' });
    }

    const userData = leagueData.users.get(userId);

    if (!userData) {
      return res.status(404).json({ error: 'User not found in league system' });
    }

    const currentWeek = getCurrentWeek();

    // Check if new week started
    if (userData.lastActiveWeek !== currentWeek) {
      // New week - archive old data and reset
      userData.history.push({
        week: userData.lastActiveWeek,
        weeklyXP: userData.weeklyXP,
        rank: userData.rank,
        league: userData.currentLeague
      });
      userData.weeklyXP = 0;
      userData.lastActiveWeek = currentWeek;
    }

    // Update XP
    userData.totalXP += xpAmount;
    userData.weeklyXP += xpAmount;

    // Check if tier should change based on total XP
    const newTier = getLeagueTierForXP(userData.totalXP);
    if (newTier.id !== userData.currentLeague) {
      userData.currentLeague = newTier.id;
      userData.leagueInstanceId = assignToLeagueInstance(newTier.id, userId);
    }

    leagueData.users.set(userId, userData);

    // Get updated rankings
    const rankings = getLeagueRankings(userData.currentLeague, userData.leagueInstanceId);
    const userRank = rankings.findIndex(u => u.userId === userId) + 1;
    userData.rank = userRank;

    res.json({
      success: true,
      userData,
      xpAdded: xpAmount,
      activity,
      newRank: userRank
    });
  } catch (error) {
    console.error('Update XP error:', error);
    res.status(500).json({ error: 'Failed to update XP', details: error.message });
  }
});

/**
 * GET /api/leagues/rankings/:userId
 * Get rankings for user's current league
 */
router.get('/rankings/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    const userData = leagueData.users.get(userId);

    if (!userData) {
      return res.status(404).json({ error: 'User not found in league system' });
    }

    const rankings = getLeagueRankings(userData.currentLeague, userData.leagueInstanceId);
    const tier = LEAGUES[userData.currentLeague.toUpperCase()];

    // Calculate time until week end
    const now = new Date();
    const weekStart = getWeekStart();
    const weekEnd = new Date(weekStart + 7 * 24 * 60 * 60 * 1000);
    const timeUntilReset = weekEnd - now;

    res.json({
      success: true,
      tier,
      rankings,
      userRank: rankings.findIndex(u => u.userId === userId) + 1,
      weekEndsIn: timeUntilReset,
      weekEndsAt: weekEnd.toISOString(),
      currentWeek: getCurrentWeek()
    });
  } catch (error) {
    console.error('Get rankings error:', error);
    res.status(500).json({ error: 'Failed to get rankings', details: error.message });
  }
});

/**
 * GET /api/leagues/user/:userId
 * Get user's league data and stats
 */
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    const userData = leagueData.users.get(userId);

    if (!userData) {
      return res.status(404).json({ error: 'User not found in league system' });
    }

    const tier = LEAGUES[userData.currentLeague.toUpperCase()];
    const rankings = getLeagueRankings(userData.currentLeague, userData.leagueInstanceId);
    const userRank = rankings.findIndex(u => u.userId === userId) + 1;

    // Calculate promotion/demotion status
    const promotionZone = userRank <= 10;
    const demotionZone = userRank >= LEAGUE_SIZE - 10;
    const nextTier = getNextTier(userData.currentLeague);
    const prevTier = getPreviousTier(userData.currentLeague);

    res.json({
      success: true,
      userData: {
        ...userData,
        rank: userRank
      },
      tier,
      stats: {
        promotionZone,
        demotionZone,
        canPromote: promotionZone && nextTier !== null,
        canDemote: demotionZone && prevTier !== null,
        nextTier,
        prevTier
      },
      weeklyStats: {
        currentWeek: getCurrentWeek(),
        weeklyXP: userData.weeklyXP,
        averageWeeklyXP: calculateAverageWeeklyXP(userData),
        bestWeek: getBestWeek(userData)
      }
    });
  } catch (error) {
    console.error('Get user data error:', error);
    res.status(500).json({ error: 'Failed to get user data', details: error.message });
  }
});

/**
 * POST /api/leagues/reset-week
 * Admin endpoint to trigger weekly reset
 */
router.post('/reset-week', (req, res) => {
  try {
    const currentWeek = getCurrentWeek();
    const promotions = [];
    const demotions = [];

    // Process each league instance
    for (const [userId, userData] of leagueData.users.entries()) {
      const rankings = getLeagueRankings(userData.currentLeague, userData.leagueInstanceId);
      const userRank = rankings.findIndex(u => u.userId === userId) + 1;

      // Archive week data
      userData.history.push({
        week: currentWeek,
        weeklyXP: userData.weeklyXP,
        rank: userRank,
        league: userData.currentLeague
      });

      // Handle promotions (top 10)
      if (userRank <= 10 && userRank > 0) {
        const nextTier = getNextTier(userData.currentLeague);
        if (nextTier) {
          userData.currentLeague = nextTier;
          userData.leagueInstanceId = assignToLeagueInstance(nextTier, userId);
          promotions.push({ userId, from: userData.currentLeague, to: nextTier, rank: userRank });
        }
      }

      // Handle demotions (bottom 10)
      if (userRank >= LEAGUE_SIZE - 10 && userRank <= LEAGUE_SIZE) {
        const prevTier = getPreviousTier(userData.currentLeague);
        if (prevTier) {
          userData.currentLeague = prevTier;
          userData.leagueInstanceId = assignToLeagueInstance(prevTier, userId);
          demotions.push({ userId, from: userData.currentLeague, to: prevTier, rank: userRank });
        }
      }

      // Reset weekly XP
      userData.weeklyXP = 0;
      userData.rank = null;
    }

    // Create snapshot
    leagueData.weeklySnapshots.push({
      week: currentWeek,
      timestamp: new Date().toISOString(),
      promotions,
      demotions,
      totalUsers: leagueData.users.size
    });

    res.json({
      success: true,
      week: currentWeek,
      promotions: promotions.length,
      demotions: demotions.length,
      totalUsers: leagueData.users.size
    });
  } catch (error) {
    console.error('Reset week error:', error);
    res.status(500).json({ error: 'Failed to reset week', details: error.message });
  }
});

/**
 * Helper: Assign user to a league instance
 */
function assignToLeagueInstance(leagueTier, userId) {
  // For now, use a simple hash-based assignment
  // In production, balance instances by size
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const instanceId = `${leagueTier}-${hash % 100}`; // 100 instances per tier
  return instanceId;
}

/**
 * Helper: Get rankings for a league instance
 */
function getLeagueRankings(leagueTier, instanceId) {
  const usersInInstance = Array.from(leagueData.users.values())
    .filter(u => u.currentLeague === leagueTier && u.leagueInstanceId === instanceId)
    .sort((a, b) => b.weeklyXP - a.weeklyXP)
    .slice(0, LEAGUE_SIZE)
    .map((u, index) => ({
      userId: u.userId,
      username: u.username,
      avatar: u.avatar,
      weeklyXP: u.weeklyXP,
      totalXP: u.totalXP,
      rank: index + 1
    }));

  // Fill with mock users if needed (for demo purposes)
  while (usersInInstance.length < LEAGUE_SIZE) {
    usersInInstance.push({
      userId: `mock_${usersInInstance.length}`,
      username: `Player ${usersInInstance.length + 1}`,
      avatar: '👤',
      weeklyXP: Math.max(0, Math.floor(Math.random() * 500) - (usersInInstance.length * 5)),
      totalXP: Math.floor(Math.random() * 5000),
      rank: usersInInstance.length + 1,
      isMock: true
    });
  }

  return usersInInstance;
}

/**
 * Helper: Get next tier
 */
function getNextTier(currentTier) {
  const tiers = Object.keys(LEAGUES);
  const currentIndex = tiers.findIndex(t => t.toLowerCase() === currentTier.toLowerCase());
  if (currentIndex < tiers.length - 1) {
    return tiers[currentIndex + 1].toLowerCase();
  }
  return null;
}

/**
 * Helper: Get previous tier
 */
function getPreviousTier(currentTier) {
  const tiers = Object.keys(LEAGUES);
  const currentIndex = tiers.findIndex(t => t.toLowerCase() === currentTier.toLowerCase());
  if (currentIndex > 0) {
    return tiers[currentIndex - 1].toLowerCase();
  }
  return null;
}

/**
 * Helper: Calculate average weekly XP
 */
function calculateAverageWeeklyXP(userData) {
  if (!userData.history || userData.history.length === 0) {
    return userData.weeklyXP;
  }

  const totalWeeks = userData.history.length + 1;
  const totalXP = userData.history.reduce((sum, week) => sum + week.weeklyXP, 0) + userData.weeklyXP;
  return Math.round(totalXP / totalWeeks);
}

/**
 * Helper: Get best week
 */
function getBestWeek(userData) {
  if (!userData.history || userData.history.length === 0) {
    return { week: getCurrentWeek(), xp: userData.weeklyXP };
  }

  const allWeeks = [...userData.history, { week: getCurrentWeek(), weeklyXP: userData.weeklyXP }];
  const best = allWeeks.reduce((max, week) => week.weeklyXP > max.weeklyXP ? week : max);

  return { week: best.week, xp: best.weeklyXP };
}

/**
 * GET /api/leagues/leaderboard/global
 * Get global leaderboard across all leagues
 */
router.get('/leaderboard/global', (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const globalLeaderboard = Array.from(leagueData.users.values())
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, parseInt(limit))
      .map((u, index) => ({
        rank: index + 1,
        userId: u.userId,
        username: u.username,
        avatar: u.avatar,
        totalXP: u.totalXP,
        weeklyXP: u.weeklyXP,
        league: u.currentLeague
      }));

    res.json({
      success: true,
      leaderboard: globalLeaderboard,
      totalUsers: leagueData.users.size
    });
  } catch (error) {
    console.error('Get global leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard', details: error.message });
  }
});

module.exports = router;
