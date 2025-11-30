'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format, differenceInDays, isToday } from 'date-fns'
import {
  FireIcon,
  CalendarIcon,
  CheckCircleIcon,
  MoreHorizontalIcon,
  ClockIcon
} from 'lucide-react'
import { useCheckInHabit } from '@/hooks/useSupabaseQuery'
import { useAppStore } from '@/store'
import { clsx } from 'clsx'
import { HabitHeatmap } from './HabitHeatmap'

interface HabitCardProps {
  habit: {
    id: string
    name: string
    frequency: 'daily' | 'weekly' | 'monthly'
    xp_reward: number
    current_streak: number
    longest_streak: number
    last_completed_date?: string
  }
  compact?: boolean
}

export function HabitCard({ habit, compact = false }: HabitCardProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const checkInHabit = useCheckInHabit()
  const habitLogs = useAppStore((state) => state.habitLogs)

  const checkIn = async () => {
    if (isLoading) return

    // Check if already checked in today
    const today = new Date().toISOString().split('T')[0]
    const alreadyCheckedIn = habitLogs.some(
      log => log.habit_id === habit.id && log.completed_date === today
    )

    if (alreadyCheckedIn) return

    setIsLoading(true)

    try {
      await checkInHabit.mutateAsync({
        habitId: habit.id,
        completedDate: today,
      })

      setIsCheckedIn(true)
    } catch (error) {
      console.error('Failed to check in habit:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'weekly':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'monthly':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-600 dark:text-purple-400'
    if (streak >= 14) return 'text-red-600 dark:text-red-400'
    if (streak >= 7) return 'text-orange-600 dark:text-orange-400'
    if (streak >= 3) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return '🔥'
    if (streak >= 14) return '💪'
    if (streak >= 7) return '⚡'
    if (streak >= 3) return '🌟'
    return '✨'
  }

  const getMotivationalMessage = (streak: number) => {
    if (streak >= 100) return 'Legendary! You\'re unstoppable!'
    if (streak >= 50) return 'Incredible! Keep the momentum!'
    if (streak >= 30) return 'Iron Habit! You\'ve built a solid routine!'
    if (streak >= 21) return 'Amazing! It takes 21 days to form a habit!'
    if (streak >= 14) return 'Great! Two weeks of consistency!'
    if (streak >= 7) return 'Awesome! One week streak!'
    if (streak >= 3) return 'Good start! Keep it going!'
    return 'You\'ve got this! Every day counts!'
  }

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {habit.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={clsx(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                getFrequencyColor(habit.frequency)
              )}>
                {habit.frequency}
              </span>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <FireIcon className="w-3 h-3 mr-1" />
                {habit.current_streak} day streak
              </div>
            </div>
          </div>
          <button
            onClick={checkIn}
            disabled={isLoading || isCheckedIn}
            className={clsx(
              'flex items-center justify-center w-12 h-12 rounded-full font-medium transition-colors',
              isCheckedIn
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
            )}
          >
            {isCheckedIn ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <span className="text-lg">{getStreakIcon(habit.current_streak)}</span>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <span>Best: {habit.longest_streak}</span>
            </div>
            <div className="flex items-center">
              <span>+{habit.xp_reward} XP</span>
            </div>
          </div>
          <HabitHeatmap habitId={habit.id} compact />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {habit.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={clsx(
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                getFrequencyColor(habit.frequency)
              )}>
                {habit.frequency}
              </span>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <CalendarIcon className="w-4 h-4 mr-1" />
                {habit.frequency === 'daily' ? 'Every day' :
                 habit.frequency === 'weekly' ? 'Every week' : 'Every month'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className={`text-2xl font-bold ${getStreakColor(habit.current_streak)}`}>
                {habit.current_streak}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                day streak
              </div>
            </div>
            <div className="text-3xl">
              {getStreakIcon(habit.current_streak)}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Current streak</span>
            <span>Longest streak: {habit.longest_streak} days</span>
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (habit.current_streak / habit.longest_streak) * 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {getMotivationalMessage(habit.current_streak)}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            This week's progress
          </div>
          <HabitHeatmap habitId={habit.id} />
        </div>

        {habit.last_completed_date && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <ClockIcon className="w-4 h-4 mr-1" />
            Last completed: {format(new Date(habit.last_completed_date), 'MMM d, yyyy')}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">XP Reward:</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-white">
                +{habit.xp_reward}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {habit.last_completed_date && !isToday(new Date(habit.last_completed_date)) && (
              <span className="text-xs text-orange-600 dark:text-orange-400">
                Check in today!
              </span>
            )}
            <button
              onClick={checkIn}
              disabled={isLoading || isCheckedIn}
              className={clsx(
                'inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors',
                isCheckedIn
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
              )}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isCheckedIn ? (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Checked In
                </>
              ) : (
                <>
                  <FireIcon className="w-4 h-4 mr-2" />
                  Check In
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Link
            href={`/habits/${habit.id}`}
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View Details
          </Link>
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span>Created: {format(new Date(habit.created_at), 'MMM d')}</span>
            <span>Active: {Math.round(
              (new Date().getTime() - new Date(habit.created_at).getTime()) / (1000 * 60 * 60 * 24)
            )} days</span>
          </div>
        </div>
      </div>
    </div>
  )
}