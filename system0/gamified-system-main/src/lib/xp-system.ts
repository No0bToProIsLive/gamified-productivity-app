// XP calculation rules
export const XP_REWARDS = {
  TASK_HIGH: 50,
  TASK_MEDIUM: 30,
  TASK_LOW: 10,
  HABIT_DAILY: 20,
  HABIT_WEEKLY: 15,
  HABIT_MONTHLY: 10,
  MILESTONE_COMPLETE: 100,
  DAILY_BONUS: 5,
  CHALLENGE_COMPLETE: 100,
  GOAL_COMPLETE: 200,
  ACHIEVEMENT_BONUS: 25,
} as const

// XP required for levels (non-linear after level 10)
export const XP_LEVEL_THRESHOLDS = [
  0,   // Level 1: 0 XP
  100, // Level 2: 100 XP
  200, // Level 3: 200 XP
  300, // Level 4: 300 XP
  400, // Level 5: 400 XP
  500, // Level 6: 500 XP
  600, // Level 7: 600 XP
  700, // Level 8: 700 XP
  800, // Level 9: 800 XP
  900, // Level 10: 900 XP
  1000, // Level 11: 1000 XP
  1200, // Level 12: 1200 XP
  1400, // Level 13: 1400 XP
  1600, // Level 14: 1600 XP
  1800, // Level 15: 1800 XP
  2000, // Level 16: 2000 XP
  2250, // Level 17: 2250 XP
  2500, // Level 18: 2500 XP
  2750, // Level 19: 2750 XP
  3000, // Level 20: 3000 XP
  3300, // Level 21: 3300 XP
  3600, // Level 22: 3600 XP
  3900, // Level 23: 3900 XP
  4200, // Level 24: 4200 XP
  4500, // Level 25: 4500 XP
]

// Level calculation function
export const calculateLevel = (totalXp: number): number => {
  if (totalXp < 0) return 1

  for (let i = XP_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_LEVEL_THRESHOLDS[i]) {
      return i + 1
    }
  }
  return 1
}

// XP needed to reach the next level
export const xpForNextLevel = (currentLevel: number): number => {
  if (currentLevel <= 1) return XP_LEVEL_THRESHOLDS[1] // 100 XP for level 2
  if (currentLevel > XP_LEVEL_THRESHOLDS.length) {
    // For very high levels beyond our chart, use exponential growth
    const lastKnownXP = XP_LEVEL_THRESHOLDS[XP_LEVEL_THRESHOLDS.length - 1]
    const levelsBeyond = currentLevel - XP_LEVEL_THRESHOLDS.length
    return lastKnownXP * Math.pow(1.5, levelsBeyond)
  }
  return XP_LEVEL_THRESHOLDS[currentLevel] // array is 0-indexed, levels start at 1
}

// XP earned so far in current level
export const xpInCurrentLevel = (totalXp: number): number => {
  const level = calculateLevel(totalXp)
  if (level <= 1) return totalXp
  return totalXp - XP_LEVEL_THRESHOLDS[level - 2] // subtract XP needed for previous level
}

// Progress to next level (0-1)
export const levelProgress = (totalXp: number): number => {
  const currentLevel = calculateLevel(totalXp)
  const currentLevelXp = xpInCurrentLevel(totalXp)
  const nextLevelXp = xpForNextLevel(currentLevel) - XP_LEVEL_THRESHOLDS[currentLevel - 2]

  if (currentLevel >= XP_LEVEL_THRESHOLDS.length) {
    // For high levels, cap progress at 99%
    return Math.min(0.99, currentLevelXp / nextLevelXp)
  }

  return currentLevelXp / (xpForNextLevel(currentLevel) - (currentLevel > 1 ? XP_LEVEL_THRESHOLDS[currentLevel - 2] : 0))
}

// Calculate XP for task completion
export const calculateTaskXP = (
  priority: 'High' | 'Medium' | 'Low',
  baseXP?: number
): number => {
  if (baseXP) return baseXP

  switch (priority) {
    case 'High':
      return XP_REWARDS.TASK_HIGH
    case 'Medium':
      return XP_REWARDS.TASK_MEDIUM
    case 'Low':
      return XP_REWARDS.TASK_LOW
    default:
      return XP_REWARDS.TASK_MEDIUM
  }
}

// Calculate XP for habit completion
export const calculateHabitXP = (
  frequency: 'daily' | 'weekly' | 'monthly',
  baseXP?: number
): number => {
  if (baseXP) return baseXP

  switch (frequency) {
    case 'daily':
      return XP_REWARDS.HABIT_DAILY
    case 'weekly':
      return XP_REWARDS.HABIT_WEEKLY
    case 'monthly':
      return XP_REWARDS.HABIT_MONTHLY
    default:
      return XP_REWARDS.HABIT_DAILY
  }
}

// Streak bonus calculation
export const calculateStreakBonus = (streakDays: number): number => {
  if (streakDays >= 30) return 25 // Iron habit bonus
  if (streakDays >= 14) return 15 // Two week bonus
  if (streakDays >= 7) return 10 // One week bonus
  if (streakDays >= 3) return 5 // Three day bonus
  return 0
}

// Check if user leveled up
export const checkLevelUp = (oldXP: number, newXP: number): boolean => {
  const oldLevel = calculateLevel(oldXP)
  const newLevel = calculateLevel(newXP)
  return newLevel > oldLevel
}

// Get levels gained
export const getLevelsGained = (oldXP: number, newXP: number): number => {
  const oldLevel = calculateLevel(oldXP)
  const newLevel = calculateLevel(newXP)
  return newLevel - oldLevel
}

// Get level title/name based on level
export const getLevelTitle = (level: number): string => {
  if (level >= 50) return 'Productivity Master'
  if (level >= 40) return 'Goal Crusher'
  if (level >= 35) return 'Habit Legend'
  if (level >= 30) return 'Task Virtuoso'
  if (level >= 25) return 'Elite Achiever'
  if (level >= 20) return 'Expert Planner'
  if (level >= 15) return 'Dedicated Builder'
  if (level >= 10) return 'Rising Star'
  if (level >= 5) return 'Procrastination Fighter'
  if (level >= 3) return 'Productivity Apprentice'
  if (level >= 2) return 'Task Beginner'
  return 'Newcomer'
}

// Get level color for UI
export const getLevelColor = (level: number): string => {
  if (level >= 50) return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20'
  if (level >= 40) return 'text-red-600 bg-red-100 dark:bg-red-900/20'
  if (level >= 35) return 'text-pink-600 bg-pink-100 dark:bg-pink-900/20'
  if (level >= 30) return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20'
  if (level >= 25) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
  if (level >= 20) return 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/20'
  if (level >= 15) return 'text-teal-600 bg-teal-100 dark:bg-teal-900/20'
  if (level >= 10) return 'text-green-600 bg-green-100 dark:bg-green-900/20'
  if (level >= 5) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
  if (level >= 3) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
  if (level >= 2) return 'text-gray-600 bg-gray-100 dark:bg-gray-700'
  return 'text-gray-500 bg-gray-50 dark:bg-gray-800'
}

// Calculate daily challenge XP target based on user level
export const calculateDailyChallengeXP = (userLevel: number): number => {
  const baseXP = 50
  const levelMultiplier = Math.min(1 + (userLevel - 1) * 0.1, 3) // Up to 3x base XP
  return Math.round(baseXP * levelMultiplier)
}

// Calculate XP transaction with bonuses
export const calculateXPWithBonuses = (
  baseXP: number,
  bonuses: {
    streak?: number
    priority?: 'High' | 'Medium' | 'Low'
    isFirstCompletion?: boolean
    isDailyStreak?: boolean
  } = {}
): number => {
  let totalXP = baseXP

  // Streak bonus
  if (bonuses.streak && bonuses.streak > 0) {
    totalXP += calculateStreakBonus(bonuses.streak)
  }

  // Priority bonus (high priority gets extra)
  if (bonuses.priority === 'High') {
    totalXP += 10
  }

  // First completion bonus
  if (bonuses.isFirstCompletion) {
    totalXP += 15
  }

  // Daily streak bonus
  if (bonuses.isDailyStreak) {
    totalXP += 5
  }

  return totalXP
}

// XP analytics for user progress tracking
export interface XPAnalytics {
  totalXP: number
  currentLevel: number
  nextLevelXP: number
  currentLevelXP: number
  progressPercentage: number
  levelTitle: string
  levelColor: string
  xpToNextLevel: number
  averageXPPerDay: number
  todayXP: number
  thisWeekXP: number
  thisMonthXP: number
}

export const calculateXPAnalytics = (
  totalXP: number,
  userJoinDate: string,
  todayXP: number,
  thisWeekXP: number,
  thisMonthXP: number
): XPAnalytics => {
  const currentLevel = calculateLevel(totalXP)
  const nextLevelXP = xpForNextLevel(currentLevel)
  const currentLevelXP = xpInCurrentLevel(totalXP)
  const progressPercentage = levelProgress(totalXP)
  const levelTitle = getLevelTitle(currentLevel)
  const levelColor = getLevelColor(currentLevel)
  const xpToNextLevel = Math.max(0, nextLevelXP - currentLevelXP)

  // Calculate average XP per day
  const joinDate = new Date(userJoinDate)
  const today = new Date()
  const daysSinceJoin = Math.max(1, Math.ceil((today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)))
  const averageXPPerDay = Math.round(totalXP / daysSinceJoin)

  return {
    totalXP,
    currentLevel,
    nextLevelXP,
    currentLevelXP,
    progressPercentage,
    levelTitle,
    levelColor,
    xpToNextLevel,
    averageXPPerDay,
    todayXP,
    thisWeekXP,
    thisMonthXP,
  }
}