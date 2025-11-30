'use client'

import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store'

// Types for our database tables
type Database = any
type Tables = Database['public']['Tables']

// Generic fetch function
export function useSupabaseQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
  }
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 3,
    ...options,
  })
}

// Generic mutation function
export function useSupabaseMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<T>,
  invalidateQueries?: string[][],
  options?: {
    onSuccess?: (data: T, variables: V) => void
    onError?: (error: any, variables: V) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      invalidateQueries?.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey })
      })

      // Call custom onSuccess
      options?.onSuccess?.(data, variables)
    },
    onError: options?.onError,
  })
}

// Tasks queries
export function useTasks(filters?: {
  status?: string
  priority?: string
  area?: string
  search?: string
}) {
  const userId = supabase.auth.getUser().then(({ data: { user } }) => user?.id)

  return useSupabaseQuery(
    ['tasks', filters],
    async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters?.area) {
        query = query.eq('area', filters.area)
      }
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    {
      enabled: !!userId,
    }
  )
}

export function useCreateTask() {
  return useSupabaseMutation(
    async (task: {
      title: string
      description?: string
      priority: 'High' | 'Medium' | 'Low'
      due_date?: string
      tags?: string[]
      area?: string
      estimated_xp?: number
      is_recurring?: boolean
      recurrence?: 'daily' | 'weekly' | 'monthly'
    }) => {
      const { data: user } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...task,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    [['tasks']],
    {
      onSuccess: (data) => {
        // Add to store
        useAppStore.getState().addTask(data)
      },
    }
  )
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useSupabaseMutation(
    async ({ id, updates }: {
      id: string
      updates: Partial<{
        title: string
        description: string
        priority: 'High' | 'Medium' | 'Low'
        status: 'Todo' | 'In Progress' | 'Done'
        due_date: string
        tags: string[]
        area: string
        estimated_xp: number
        is_recurring: boolean
        recurrence: 'daily' | 'weekly' | 'monthly'
      }>
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    [['tasks']],
    {
      onSuccess: (data, { id, updates }) => {
        // Update store
        useAppStore.getState().updateTask(id, updates)

        // If task was completed, refresh user stats
        if (updates.status === 'Done') {
          queryClient.invalidateQueries({ queryKey: ['userStats'] })
          queryClient.invalidateQueries({ queryKey: ['xpTransactions'] })
        }
      },
    }
  )
}

export function useDeleteTask() {
  return useSupabaseMutation(
    async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    [['tasks']],
    {
      onSuccess: (id) => {
        // Remove from store
        useAppStore.getState().removeTask(id)
      },
    }
  )
}

// Habits queries
export function useHabits() {
  const userId = supabase.auth.getUser().then(({ data: { user } }) => user?.id)

  return useSupabaseQuery(
    ['habits'],
    async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    {
      enabled: !!userId,
    }
  )
}

export function useHabitLogs(habitId?: string) {
  return useSupabaseQuery(
    ['habitLogs', habitId],
    async () => {
      let query = supabase
        .from('habit_logs')
        .select('*')
        .order('completed_date', { ascending: false })
        .limit(100) // Last 100 logs

      if (habitId) {
        query = query.eq('habit_id', habitId)
      } else {
        const { data: user } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        query = query.in('habit_id',
          supabase.from('habits').select('id').eq('user_id', user.id)
        )
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    {
      enabled: true,
    }
  )
}

export function useCreateHabit() {
  return useSupabaseMutation(
    async (habit: {
      name: string
      frequency: 'daily' | 'weekly' | 'monthly'
      xp_reward?: number
    }) => {
      const { data: user } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('habits')
        .insert({
          ...habit,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    [['habits']],
    {
      onSuccess: (data) => {
        useAppStore.getState().addHabit(data)
      },
    }
  )
}

export function useCheckInHabit() {
  const queryClient = useQueryClient()

  return useSupabaseMutation(
    async ({ habitId, completedDate }: {
      habitId: string
      completedDate?: string
    }) => {
      const { data: user } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const date = completedDate || new Date().toISOString().split('T')[0]

      // Create habit log
      const { data: logData, error: logError } = await supabase
        .from('habit_logs')
        .insert({
          habit_id: habitId,
          completed_date: date,
        })
        .select()
        .single()

      if (logError) throw logError

      // Get current habit to calculate streak
      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .select('*')
        .eq('id', habitId)
        .single()

      if (habitError) throw habitError

      // Calculate new streak
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const { data: yesterdayLog } = await supabase
        .from('habit_logs')
        .select('completed_date')
        .eq('habit_id', habitId)
        .eq('completed_date', yesterdayStr)
        .single()

      const newStreak = yesterdayLog ? habit.current_streak + 1 : 1
      const newLongestStreak = Math.max(newStreak, habit.longest_streak)

      // Update habit with new streak
      const { data: updatedHabit, error: updateError } = await supabase
        .from('habits')
        .update({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_completed_date: date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', habitId)
        .select()
        .single()

      if (updateError) throw updateError

      return { logData, updatedHabit }
    },
    [['habits'], ['habitLogs']],
    {
      onSuccess: ({ logData, updatedHabit }, { habitId }) => {
        useAppStore.getState().addHabitLog(logData)
        useAppStore.getState().updateHabit(habitId, {
          current_streak: updatedHabit.current_streak,
          longest_streak: updatedHabit.longest_streak,
          last_completed_date: updatedHabit.last_completed_date,
        })

        // Refresh user stats and XP
        queryClient.invalidateQueries({ queryKey: ['userStats'] })
        queryClient.invalidateQueries({ queryKey: ['xpTransactions'] })
      },
    }
  )
}

// Goals queries
export function useGoals() {
  const userId = supabase.auth.getUser().then(({ data: { user } }) => user?.id)

  return useSupabaseQuery(
    ['goals'],
    async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    {
      enabled: !!userId,
    }
  )
}

export function useCreateGoal() {
  return useSupabaseMutation(
    async (goal: {
      title: string
      description?: string
      due_date?: string
      progress_percent?: number
    }) => {
      const { data: user } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goal,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    [['goals']],
    {
      onSuccess: (data) => {
        useAppStore.getState().addGoal(data)
      },
    }
  )
}

// User Stats queries
export function useUserStats() {
  return useSupabaseQuery(
    ['userStats'],
    async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return data
    },
    {
      enabled: true,
    }
  )
}

// XP Transactions queries
export function useXpTransactions(limit = 50) {
  return useSupabaseQuery(
    ['xpTransactions', limit],
    async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    },
    {
      enabled: true,
    }
  )
}