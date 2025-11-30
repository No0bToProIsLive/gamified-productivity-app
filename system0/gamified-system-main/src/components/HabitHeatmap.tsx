'use client'

import { useMemo } from 'react'
import { startOfWeek, addDays, format, isSameDay, isToday, subDays } from 'date-fns'
import { useAppStore } from '@/store'
import { clsx } from 'clsx'

interface HabitHeatmapProps {
  habitId: string
  compact?: boolean
  weeks?: number
}

export function HabitHeatmap({ habitId, compact = false, weeks = 12 }: HabitHeatmapProps) {
  const habitLogs = useAppStore((state) => state.habitLogs)

  // Generate the last X weeks of dates
  const dates = useMemo(() => {
    const end = new Date()
    const start = subDays(end, weeks * 7 - 1)
    const dates = []
    let currentDate = start

    while (currentDate <= end) {
      dates.push(new Date(currentDate))
      currentDate = addDays(currentDate, 1)
    }

    return dates
  }, [weeks])

  // Group dates by week
  const weeksData = useMemo(() => {
    const weeks = []
    const datesCopy = [...dates]

    while (datesCopy.length > 0) {
      const weekDates = datesCopy.splice(0, 7)
      weeks.push(weekDates)
    }

    return weeks
  }, [dates])

  // Check if a date was completed
  const isDateCompleted = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return habitLogs.some(
      log => log.habit_id === habitId && log.completed_date === dateStr
    )
  }

  const getDayColor = (date: Date) => {
    if (isToday(date)) return 'border-blue-500 ring-1 ring-blue-500'
    if (isDateCompleted(date)) return 'bg-green-500 dark:bg-green-400'
    return 'bg-gray-200 dark:bg-gray-700'
  }

  const getTooltipText = (date: Date) => {
    const completed = isDateCompleted(date)
    return `${format(date, 'MMM d, yyyy')}: ${completed ? 'Completed' : 'Missed'}`
  }

  if (compact) {
    // Show only last 7 days
    const last7Days = dates.slice(-7)
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

    return (
      <div className="flex items-center space-x-1">
        {last7Days.map((date, index) => (
          <div
            key={date.toISOString()}
            className={clsx(
              'w-4 h-4 rounded-sm border',
              getDayColor(date)
            )}
            title={getTooltipText(date)}
          >
            {isToday(date) && (
              <div className="w-1 h-1 bg-blue-600 rounded-full mx-auto" />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Day labels */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="w-4 text-center">
            {day.charAt(0)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {weeksData.map((week, weekIndex) => (
          <div key={weekIndex} className="flex space-x-1">
            {week.map((date, dayIndex) => (
              <div
                key={date.toISOString()}
                className={clsx(
                  'w-4 h-4 rounded-sm border transition-colors hover:scale-110',
                  getDayColor(date)
                )}
                title={getTooltipText(date)}
              >
                {isToday(date) && (
                  <div className="w-1 h-1 bg-blue-600 rounded-full mx-auto" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2">
        <span className="flex items-center space-x-1">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm border" />
            <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-sm border" />
          </div>
          <span>More</span>
        </span>
        <span className="flex items-center space-x-1">
          <div className="w-3 h-3 border border-blue-500 ring-1 ring-blue-500 rounded-sm" />
          <span>Today</span>
        </span>
      </div>
    </div>
  )
}