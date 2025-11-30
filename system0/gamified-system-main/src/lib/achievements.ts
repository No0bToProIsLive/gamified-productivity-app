export const ACHIEVEMENTS = [
  {
    id: 'first_task',
    title: 'First Task',
    description: 'Complete your first task',
    icon: 'check-circle',
    requirement_type: 'tasks',
    requirement_value: 1,
    xp_reward: 25,
  },
  {
    id: 'task_master',
    title: 'Task Master',
    description: 'Complete 50 tasks',
    icon: 'trophy',
    requirement_type: 'tasks',
    requirement_value: 50,
    xp_reward: 100,
  },
  {
    id: 'century',
    title: 'Century',
    description: 'Complete 100 tasks',
    icon: 'medal',
    requirement_type: 'tasks',
    requirement_value: 100,
    xp_reward: 200,
  },
  {
    id: 'habit_builder',
    title: 'Habit Builder',
    description: 'Create your first habit',
    icon: 'repeat',
    requirement_type: 'habits_created',
    requirement_value: 1,
    xp_reward: 30,
  },
  {
    id: 'consistency_streak',
    title: 'Consistency Streak',
    description: 'Maintain a 7-day habit streak',
    icon: 'fire',
    requirement_type: 'streak',
    requirement_value: 7,
    xp_reward: 50,
  },
  {
    id: 'iron_habit',
    title: 'Iron Habit',
    description: 'Maintain a 30-day habit streak',
    icon: 'flame',
    requirement_type: 'streak',
    requirement_value: 30,
    xp_reward: 150,
  },
  {
    id: 'level_5',
    title: 'Level 5',
    description: 'Reach level 5',
    icon: 'star',
    requirement_type: 'level',
    requirement_value: 5,
    xp_reward: 40,
  },
  {
    id: 'level_10',
    title: 'Level 10',
    description: 'Reach level 10',
    icon: 'award',
    requirement_type: 'level',
    requirement_value: 10,
    xp_reward: 100,
  },
  {
    id: 'level_25',
    title: 'Level 25',
    description: 'Reach level 25',
    icon: 'crown',
    requirement_type: 'level',
    requirement_value: 25,
    xp_reward: 250,
  },
  {
    id: 'coin_collector',
    title: 'Coin Collector',
    description: 'Earn 500 coins',
    icon: 'coins',
    requirement_type: 'coins',
    requirement_value: 500,
    xp_reward: 75,
  },
  {
    id: 'goal_setter',
    title: 'Goal Setter',
    description: 'Create your first goal',
    icon: 'target',
    requirement_type: 'goals_created',
    requirement_value: 1,
    xp_reward: 25,
  },
  {
    id: 'goal_crusher',
    title: 'Goal Crusher',
    description: 'Complete 5 goals',
    icon: 'target',
    requirement_type: 'goals',
    requirement_value: 5,
    xp_reward: 150,
  },
  {
    id: 'weekly_warrior',
    title: 'Weekly Warrior',
    description: 'Complete tasks for 7 consecutive days',
    icon: 'calendar',
    requirement_type: 'active_days',
    requirement_value: 7,
    xp_reward: 75,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a task between 9 PM - 6 AM',
    icon: 'moon',
    requirement_type: 'night_task',
    requirement_value: 1,
    xp_reward: 20,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a task between 5 AM - 9 AM',
    icon: 'sun',
    requirement_type: 'morning_task',
    requirement_value: 1,
    xp_reward: 20,
  },
  {
    id: 'task_explorer',
    title: 'Task Explorer',
    description: 'Create tasks in 5 different areas',
    icon: 'compass',
    requirement_type: 'areas',
    requirement_value: 5,
    xp_reward: 60,
  },
  {
    id: 'priority_master',
    title: 'Priority Master',
    description: 'Complete 25 high priority tasks',
    icon: 'flag',
    requirement_type: 'high_priority_tasks',
    requirement_value: 25,
    xp_reward: 125,
  },
  {
    id: 'habit_guru',
    title: 'Habit Guru',
    description: 'Maintain 5 active habits simultaneously',
    icon: 'brain',
    requirement_type: 'concurrent_habits',
    requirement_value: 5,
    xp_reward: 80,
  },
  {
    id: 'streak_keeper',
    title: 'Streak Keeper',
    description: 'Complete habits for 21 consecutive days',
    icon: 'shield',
    requirement_type: 'habit_streak',
    requirement_value: 21,
    xp_reward: 120,
  },
  {
    id: 'xp_collector',
    title: 'XP Collector',
    description: 'Earn 1000 XP',
    icon: 'zap',
    requirement_type: 'total_xp',
    requirement_value: 1000,
    xp_reward: 200,
  },
  {
    id: 'daily_champion',
    title: 'Daily Champion',
    description: 'Complete 7 daily challenges',
    icon: 'calendar-check',
    requirement_type: 'daily_challenges',
    requirement_value: 7,
    xp_reward: 175,
  },
  {
    id: 'early_adopter',
    title: 'Early Adopter',
    description: 'Sign up within the first week of launch',
    icon: 'rocket',
    requirement_type: 'early_signup',
    requirement_value: 1,
    xp_reward: 50,
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Add 10 friends',
    icon: 'users',
    requirement_type: 'friends',
    requirement_value: 10,
    xp_reward: 90,
  },
  {
    id: 'shop_keeper',
    title: 'Shop Keeper',
    description: 'Redeem 10 rewards',
    icon: 'shopping-bag',
    requirement_type: 'rewards_redeemed',
    requirement_value: 10,
    xp_reward: 65,
  },
] as const

export type Achievement = typeof ACHIEVEMENTS[number]
export type AchievementProgress = Achievement & {
  current_value: number
  progress_percentage: number
  unlocked: boolean
  unlocked_at?: string
}

// Calculate progress for an achievement
export const calculateAchievementProgress = (
  achievement: Achievement,
  currentValue: number,
  unlockedAt?: string
): AchievementProgress => {
  const unlocked = !!unlockedAt
  const progressPercentage = Math.min(100, Math.round((currentValue / achievement.requirement_value) * 100))

  return {
    ...achievement,
    current_value: currentValue,
    progress_percentage: progressPercentage,
    unlocked,
    unlocked_at: unlockedAt,
  }
}

// Check achievements based on user stats
export const checkAchievements = async (
  userStats: {
    total_tasks_completed: number
    longest_habit_streak: number
    total_xp: number
    current_level: number
    coins: number
    habits_count?: number
    goals_completed?: number
    active_days?: number
    night_tasks?: number
    morning_tasks?: number
    areas_count?: number
    high_priority_tasks?: number
    concurrent_habits?: number
    habit_streak?: number
    daily_challenges?: number
    is_early_adopter?: boolean
    friends_count?: number
    rewards_redeemed?: number
    goals_created?: number
    habits_created?: number
  },
  unlockedAchievements: string[] = []
): Promise<{ unlocked: Achievement[], progress: AchievementProgress[] }> => {
  const unlocked: Achievement[] = []
  const progress: AchievementProgress[] = []

  // Function to add achievement if unlocked
  const checkAndAdd = (
    achievementId: string,
    currentValue: number,
    requirementValue: number,
    isUnlocked: boolean = false
  ) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!achievement) return

    const wasUnlocked = unlockedAchievements.includes(achievementId)
    const qualifies = currentValue >= requirementValue

    if (!wasUnlocked && qualifies) {
      unlocked.push(achievement)
      isUnlocked = true
    }

    const achievementProgress = calculateAchievementProgress(
      achievement,
      currentValue,
      wasUnlocked ? new Date().toISOString() : undefined
    )
    progress.push(achievementProgress)
  }

  // Check all achievement types
  checkAndAdd('first_task', userStats.total_tasks_completed, 1)
  checkAndAdd('task_master', userStats.total_tasks_completed, 50)
  checkAndAdd('century', userStats.total_tasks_completed, 100)
  checkAndAdd('habit_builder', userStats.habits_created || 0, 1)
  checkAndAdd('goal_setter', userStats.goals_created || 0, 1)
  checkAndAdd('consistency_streak', userStats.longest_habit_streak, 7)
  checkAndAdd('iron_habit', userStats.longest_habit_streak, 30)
  checkAndAdd('level_5', userStats.current_level, 5)
  checkAndAdd('level_10', userStats.current_level, 10)
  checkAndAdd('level_25', userStats.current_level, 25)
  checkAndAdd('coin_collector', userStats.coins, 500)
  checkAndAdd('goal_crusher', userStats.goals_completed || 0, 5)
  checkAndAdd('weekly_warrior', userStats.active_days || 0, 7)
  checkAndAdd('night_owl', userStats.night_tasks || 0, 1)
  checkAndAdd('early_bird', userStats.morning_tasks || 0, 1)
  checkAndAdd('task_explorer', userStats.areas_count || 0, 5)
  checkAndAdd('priority_master', userStats.high_priority_tasks || 0, 25)
  checkAndAdd('habit_guru', userStats.concurrent_habits || 0, 5)
  checkAndAdd('streak_keeper', userStats.habit_streak || 0, 21)
  checkAndAdd('xp_collector', userStats.total_xp, 1000)
  checkAndAdd('daily_champion', userStats.daily_challenges || 0, 7)
  checkAndAdd('early_adopter', userStats.is_early_adopter ? 1 : 0, 1)
  checkAndAdd('social_butterfly', userStats.friends_count || 0, 10)
  checkAndAdd('shop_keeper', userStats.rewards_redeemed || 0, 10)

  return { unlocked, progress }
}

// Get achievement by ID
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id)
}

// Get achievements by category
export const getAchievementsByType = (type: Achievement['requirement_type']): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.requirement_type === type)
}

// Sort achievements by progress
export const sortAchievementsByProgress = (achievements: AchievementProgress[]): AchievementProgress[] => {
  return achievements.sort((a, b) => {
    // Put unlocked achievements at the end
    if (a.unlocked && !b.unlocked) return 1
    if (!a.unlocked && b.unlocked) return -1

    // Sort by progress percentage (descending)
    if (a.progress_percentage !== b.progress_percentage) {
      return b.progress_percentage - a.progress_percentage
    }

    // Sort by requirement value (ascending)
    return a.requirement_value - b.requirement_value
  })
}

// Get next achievements to unlock (top 3 closest to completion)
export const getNextAchievements = (progress: AchievementProgress[]): AchievementProgress[] => {
  const lockedAchievements = progress.filter(a => !a.unlocked)
  return sortAchievementsByProgress(lockedAchievements).slice(0, 3)
}

// Get achievement rarity category
export const getAchievementRarity = (requirementValue: number): 'Common' | 'Rare' | 'Epic' | 'Legendary' => {
  if (requirementValue <= 5) return 'Common'
  if (requirementValue <= 25) return 'Rare'
  if (requirementValue <= 100) return 'Epic'
  return 'Legendary'
}

// Get achievement color based on rarity
export const getAchievementColor = (achievement: Achievement): string => {
  const rarity = getAchievementRarity(achievement.requirement_value)

  switch (rarity) {
    case 'Legendary':
      return 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-400'
    case 'Epic':
      return 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white border-purple-400'
    case 'Rare':
      return 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-blue-400'
    case 'Common':
    default:
      return 'bg-gradient-to-br from-gray-500 to-gray-600 text-white border-gray-400'
  }
}

// Achievement notification duration based on rarity
export const getAchievementNotificationDuration = (achievement: Achievement): number => {
  const rarity = getAchievementRarity(achievement.requirement_value)

  switch (rarity) {
    case 'Legendary':
      return 8000 // 8 seconds
    case 'Epic':
      return 6000 // 6 seconds
    case 'Rare':
      return 4000 // 4 seconds
    case 'Common':
    default:
      return 3000 // 3 seconds
  }
}

// Format achievement requirement for display
export const formatAchievementRequirement = (achievement: Achievement): string => {
  switch (achievement.requirement_type) {
    case 'tasks':
      return `${achievement.requirement_value} tasks`
    case 'habits_created':
      return `Create ${achievement.requirement_value} habit${achievement.requirement_value > 1 ? 's' : ''}`
    case 'streak':
      return `${achievement.requirement_value} day streak`
    case 'level':
      return `Reach level ${achievement.requirement_value}`
    case 'coins':
      return `Earn ${achievement.requirement_value} coins`
    case 'goals_created':
      return `Create ${achievement.requirement_value} goal${achievement.requirement_value > 1 ? 's' : ''}`
    case 'goals':
      return `Complete ${achievement.requirement_value} goal${achievement.requirement_value > 1 ? 's' : ''}`
    case 'active_days':
      return `${achievement.requirement_value} active days`
    case 'night_task':
    case 'morning_task':
      return `${achievement.requirement_value} ${achievement.requirement_type === 'night_task' ? 'night' : 'morning'} task`
    case 'areas':
      return `${achievement.requirement_value} different areas`
    case 'high_priority_tasks':
      return `${achievement.requirement_value} high priority tasks`
    case 'concurrent_habits':
      return `${achievement.requirement_value} concurrent habits`
    case 'habit_streak':
      return `${achievement.requirement_value} day habit streak`
    case 'total_xp':
      return `${achievement.requirement_value} total XP`
    case 'daily_challenges':
      return `${achievement.requirement_value} daily challenges`
    case 'early_signup':
      return 'Early adopter'
    case 'friends':
      return `${achievement.requirement_value} friends`
    case 'rewards_redeemed':
      return `Redeem ${achievement.requirement_value} rewards`
    default:
      return achievement.description
  }
}

// Achievement statistics
export const getAchievementStats = (progress: AchievementProgress[]): {
  total: number
  unlocked: number
  percentage: number
  totalXP: number
  nextAchievements: AchievementProgress[]
} => {
  const total = progress.length
  const unlocked = progress.filter(a => a.unlocked).length
  const percentage = Math.round((unlocked / total) * 100)
  const totalXP = progress.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp_reward, 0)
  const nextAchievements = getNextAchievements(progress)

  return {
    total,
    unlocked,
    percentage,
    totalXP,
    nextAchievements,
  }
}