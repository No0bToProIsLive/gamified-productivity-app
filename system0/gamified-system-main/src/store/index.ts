import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Types for our store
interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Todo' | 'In Progress' | 'Done'
  due_date?: string
  tags?: string[]
  area?: string
  estimated_xp: number
  is_recurring: boolean
  recurrence?: 'daily' | 'weekly' | 'monthly'
  completed_at?: string
  created_at: string
  updated_at: string
}

interface Habit {
  id: string
  user_id: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  xp_reward: number
  current_streak: number
  longest_streak: number
  last_completed_date?: string
  created_at: string
  updated_at: string
}

interface HabitLog {
  id: string
  habit_id: string
  completed_date: string
  created_at: string
}

interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Abandoned'
  progress_percent: number
  due_date?: string
  created_at: string
  updated_at: string
}

interface UserStats {
  id: string
  user_id: string
  total_xp: number
  current_level: number
  longest_habit_streak: number
  total_tasks_completed: number
  longest_active_days: number
  updated_at: string
}

interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  achievement: {
    id: string
    title: string
    description: string
    icon_url?: string
    requirement_type: string
    requirement_value: number
  }
}

interface AppStore {
  // UI State
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'

  // Tasks State
  tasks: Task[]
  tasksLoading: boolean
  tasksError: string | null
  taskFilters: {
    status: string | null
    priority: string | null
    area: string | null
    search: string
  }

  // Habits State
  habits: Habit[]
  habitLogs: HabitLog[]
  habitsLoading: boolean
  habitsError: string | null

  // Goals State
  goals: Goal[]
  goalsLoading: boolean
  goalsError: string | null

  // User Stats State
  userStats: UserStats | null
  userStatsLoading: boolean
  achievements: UserAchievement[]
  achievementsLoading: boolean

  // Actions
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setTasks: (tasks: Task[]) => void
  setTasksLoading: (loading: boolean) => void
  setTasksError: (error: string | null) => void
  setTaskFilters: (filters: Partial<AppStore['taskFilters']>) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void

  setHabits: (habits: Habit[]) => void
  setHabitLogs: (logs: HabitLog[]) => void
  setHabitsLoading: (loading: boolean) => void
  setHabitsError: (error: string | null) => void
  addHabit: (habit: Habit) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  removeHabit: (id: string) => void
  addHabitLog: (log: HabitLog) => void

  setGoals: (goals: Goal[]) => void
  setGoalsLoading: (loading: boolean) => void
  setGoalsError: (error: string | null) => void
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  removeGoal: (id: string) => void

  setUserStats: (stats: UserStats) => void
  setUserStatsLoading: (loading: boolean) => void
  setAchievements: (achievements: UserAchievement[]) => void
  setAchievementsLoading: (loading: boolean) => void
  addAchievement: (achievement: UserAchievement) => void
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial UI State
        sidebarOpen: false,
        theme: 'system',

        // Initial Tasks State
        tasks: [],
        tasksLoading: false,
        tasksError: null,
        taskFilters: {
          status: null,
          priority: null,
          area: null,
          search: '',
        },

        // Initial Habits State
        habits: [],
        habitLogs: [],
        habitsLoading: false,
        habitsError: null,

        // Initial Goals State
        goals: [],
        goalsLoading: false,
        goalsError: null,

        // Initial User Stats State
        userStats: null,
        userStatsLoading: false,
        achievements: [],
        achievementsLoading: false,

        // UI Actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setTheme: (theme) => set({ theme }),

        // Task Actions
        setTasks: (tasks) => set({ tasks }),
        setTasksLoading: (loading) => set({ tasksLoading: loading }),
        setTasksError: (error) => set({ tasksError: error }),
        setTaskFilters: (filters) => set((state) => ({
          taskFilters: { ...state.taskFilters, ...filters }
        })),
        addTask: (task) => set((state) => ({
          tasks: [...state.tasks, task]
        })),
        updateTask: (id, updates) => set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === id ? { ...task, ...updates } : task
          )
        })),
        removeTask: (id) => set((state) => ({
          tasks: state.tasks.filter(task => task.id !== id)
        })),

        // Habit Actions
        setHabits: (habits) => set({ habits }),
        setHabitLogs: (logs) => set({ habitLogs: logs }),
        setHabitsLoading: (loading) => set({ habitsLoading: loading }),
        setHabitsError: (error) => set({ habitsError: error }),
        addHabit: (habit) => set((state) => ({
          habits: [...state.habits, habit]
        })),
        updateHabit: (id, updates) => set((state) => ({
          habits: state.habits.map(habit =>
            habit.id === id ? { ...habit, ...updates } : habit
          )
        })),
        removeHabit: (id) => set((state) => ({
          habits: state.habits.filter(habit => habit.id !== id)
        })),
        addHabitLog: (log) => set((state) => ({
          habitLogs: [...state.habitLogs, log]
        })),

        // Goal Actions
        setGoals: (goals) => set({ goals }),
        setGoalsLoading: (loading) => set({ goalsLoading: loading }),
        setGoalsError: (error) => set({ goalsError: error }),
        addGoal: (goal) => set((state) => ({
          goals: [...state.goals, goal]
        })),
        updateGoal: (id, updates) => set((state) => ({
          goals: state.goals.map(goal =>
            goal.id === id ? { ...goal, ...updates } : goal
          )
        })),
        removeGoal: (id) => set((state) => ({
          goals: state.goals.filter(goal => goal.id !== id)
        })),

        // User Stats Actions
        setUserStats: (stats) => set({ userStats: stats }),
        setUserStatsLoading: (loading) => set({ userStatsLoading: loading }),
        setAchievements: (achievements) => set({ achievements }),
        setAchievementsLoading: (loading) => set({ achievementsLoading: loading }),
        addAchievement: (achievement) => set((state) => ({
          achievements: [...state.achievements, achievement]
        })),
      }),
      {
        name: 'gamified-productivity-store',
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          theme: state.theme,
          taskFilters: state.taskFilters,
        }),
      }
    )
  )
)

// Selectors for common use cases
export const useTasks = () => useAppStore((state) => state.tasks)
export const useTasksLoading = () => useAppStore((state) => state.tasksLoading)
export const useTaskFilters = () => useAppStore((state) => state.taskFilters)

export const useHabits = () => useAppStore((state) => state.habits)
export const useHabitLogs = () => useAppStore((state) => state.habitLogs)
export const useHabitsLoading = () => useAppStore((state) => state.habitsLoading)

export const useGoals = () => useAppStore((state) => state.goals)
export const useGoalsLoading = () => useAppStore((state) => state.goalsLoading)

export const useUserStats = () => useAppStore((state) => state.userStats)
export const useAchievements = () => useAppStore((state) => state.achievements)

export const useTheme = () => useAppStore((state) => state.theme)
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen)