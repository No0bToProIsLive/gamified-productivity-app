'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, differenceInCalendarDays, endOfDay } from 'date-fns'
import {
  TargetIcon,
  FireIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon
} from 'lucide-react'
import { useAppStore } from '@/store'
import { calculateDailyChallengeXP } from '@/lib/xp-system'

export function DailyChallengeCard() {
  const [timeUntilReset, setTimeUntilReset] = useState('')
  const [progress, setProgress] = useState({
    tasksCompleted: 0,
    habitCount: 0,
    xpEarned: 0,
    completed: false,
  })

  const userStats = useAppStore((state) => state.userStats)
  const tasks = useAppStore((state) => state.tasks)
  const habitLogs = useAppStore((state) => state.habitLogs)

  // Mock challenge data (replace with real challenge from API)
  const [challenge, setChallenge] = useState({
    task_target: 3,
    habit_target: 2,
    xp_target: 50,
    coin_reward: 25,
    xp_reward: 75,
    challenge_date: format(new Date(), 'yyyy-MM-dd'),
  })

  // Calculate time until reset
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const tomorrow = endOfDay(addDays(now, 1))
      const diff = tomorrow.getTime() - now.getTime()

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeUntilReset(`${hours}h ${minutes}m`)
    }

    updateTime()
    const interval = setInterval(updateTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Calculate progress
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd')

    // Count tasks completed today
    const todayTasksCompleted = tasks.filter(task =>
      task.status === 'Done' &&
      task.completed_at &&
      task.completed_at.split('T')[0] === today
    ).length

    // Count habits completed today
    const todayHabitsCompleted = habitLogs.filter(log =>
      log.completed_date === today
    ).length

    // Calculate total XP earned today
    const todayXP = todayTasksCompleted * 30 + todayHabitsCompleted * 15 // Mock calculation

    const isCompleted =
      todayTasksCompleted >= challenge.task_target &&
      todayHabitsCompleted >= challenge.habit_target &&
      todayXP >= challenge.xp_target

    setProgress({
      tasksCompleted: todayTasksCompleted,
      habitCount: todayHabitsCompleted,
      xpEarned: todayXP,
      completed: isCompleted,
    })
  }, [tasks, habitLogs, challenge])

  const getProgressPercentage = () => {
    const taskProgress = Math.min(100, (progress.tasksCompleted / challenge.task_target) * 100)
    const habitProgress = Math.min(100, (progress.habitCount / challenge.habit_target) * 100)
    const xpProgress = Math.min(100, (progress.xpEarned / challenge.xp_target) * 100)

    return Math.round((taskProgress + habitProgress + xpProgress) / 3)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const progressPercentage = getProgressPercentage()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrophyIcon className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Daily Challenge
          </h2>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <ClockIcon className="h-4 w-4 mr-1" />
          {timeUntilReset}
        </div>
      </div>

      {/* Challenge progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {progress.completed ? 'Completed!' : 'In Progress'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {progressPercentage}% Complete
          </span>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={clsx(
              'h-3 rounded-full transition-all duration-500 ease-out relative',
              getProgressColor(progressPercentage)
            )}
            style={{ width: `${progressPercentage}%` }}
          >
            {progress.completed && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <CheckCircleIcon className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Challenge goals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Tasks goal */}
        <div className={clsx(
          'p-3 rounded-lg border',
          progress.tasksCompleted >= challenge.task_target
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Tasks
            </span>
            <TargetIcon className={clsx(
              'h-4 w-4',
              progress.tasksCompleted >= challenge.task_target
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-400 dark:text-gray-500'
            )} />
          </div>
          <div className="flex items-baseline">
            <span className={clsx(
              'text-2xl font-bold',
              progress.tasksCompleted >= challenge.task_target
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-900 dark:text-white'
            )}>
              {progress.tasksCompleted}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              / {challenge.task_target}
            </span>
          </div>
        </div>

        {/* Habits goal */}
        <div className={clsx(
          'p-3 rounded-lg border',
          progress.habitCount >= challenge.habit_target
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Habits
            </span>
            <FireIcon className={clsx(
              'h-4 w-4',
              progress.habitCount >= challenge.habit_target
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-400 dark:text-gray-500'
            )} />
          </div>
          <div className="flex items-baseline">
            <span className={clsx(
              'text-2xl font-bold',
              progress.habitCount >= challenge.habit_target
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-900 dark:text-white'
            )}>
              {progress.habitCount}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              / {challenge.habit_target}
            </span>
          </div>
        </div>

        {/* XP goal */}
        <div className={clsx(
          'p-3 rounded-lg border',
          progress.xpEarned >= challenge.xp_target
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              XP
            </span>
            <span className={clsx(
              'text-xs px-2 py-1 rounded-full font-medium',
              progress.xpEarned >= challenge.xp_target
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            )}>
              +{challenge.xp_reward} XP
            </span>
          </div>
          <div className="flex items-baseline">
            <span className={clsx(
              'text-2xl font-bold',
              progress.xpEarned >= challenge.xp_target
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-900 dark:text-white'
            )}>
              {progress.xpEarned}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              / {challenge.xp_target}
            </span>
          </div>
        </div>
      </div>

      {/* Rewards */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Reward:</span>
            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              <span className="mr-1">🪙</span>
              {challenge.coin_reward} coins
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Bonus:</span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              +{challenge.xp_reward} XP
            </span>
          </div>
        </div>

        {!progress.completed ? (
          <div className="flex items-center space-x-3">
            {progress.tasksCompleted < challenge.task_target && (
              <Link
                href="/tasks/new"
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <TargetIcon className="h-4 w-4 mr-2" />
                Add Task
              </Link>
            )}
            {progress.habitCount < challenge.habit_target && (
              <Link
                href="/habits"
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                <FireIcon className="h-4 w-4 mr-2" />
                Check Habits
              </Link>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Challenge Complete!</span>
          </div>
        )}
      </div>
    </div>
  )
}