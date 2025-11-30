'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  CalendarIcon,
  ClockIcon,
  TagIcon,
  CheckCircleIcon,
  MoreHorizontalIcon,
  PlayIcon,
  StarIcon
} from 'lucide-react'
import { useUpdateTask, useDeleteTask } from '@/hooks/useSupabaseQuery'
import { useAppStore } from '@/store'
import { clsx } from 'clsx'

interface TaskCardProps {
  task: {
    id: string
    title: string
    description?: string
    priority: 'High' | 'Medium' | 'Low'
    status: 'Todo' | 'In Progress' | 'Done'
    due_date?: string
    tags?: string[]
    area?: string
    estimated_xp: number
    completed_at?: string
  }
  compact?: boolean
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const taskFilters = useAppStore((state) => state.taskFilters)

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Done'
  const isCompleted = task.status === 'Done'

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'Todo':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const handleStatusChange = async (newStatus: 'Todo' | 'In Progress' | 'Done') => {
    if (isLoading) return
    setIsLoading(true)

    const updates: any = { status: newStatus }
    if (newStatus === 'Done') {
      updates.completed_at = new Date().toISOString()
    } else if (task.completed_at) {
      updates.completed_at = null
    }

    await updateTask.mutateAsync({
      id: task.id,
      updates,
    })

    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (isLoading || !confirm('Are you sure you want to delete this task?')) return
    setIsLoading(true)

    await deleteTask.mutateAsync(task.id)
    setIsLoading(false)
  }

  if (compact) {
    return (
      <div className={clsx(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 hover:shadow-md transition-shadow',
        isCompleted && 'opacity-60',
        isOverdue && 'border-red-300 dark:border-red-700'
      )}>
        <div className="flex items-start space-x-3">
          <button
            onClick={() => handleStatusChange(isCompleted ? 'Todo' : 'Done')}
            disabled={isLoading}
            className={clsx(
              'mt-1 w-4 h-4 rounded border-2 flex items-center justify-center',
              isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
            )}
          >
            {isCompleted && (
              <CheckCircleIcon className="w-3 h-3" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={clsx(
                'font-medium text-gray-900 dark:text-white truncate',
                isCompleted && 'line-through'
              )}>
                {task.title}
              </h3>
              <div className="flex items-center space-x-2 ml-2">
                <span className={clsx(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getPriorityColor(task.priority)
                )}>
                  {task.priority}
                </span>
                {task.due_date && (
                  <span className={clsx(
                    'inline-flex items-center text-xs',
                    isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {format(new Date(task.due_date), 'MMM d')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{task.estimated_xp} XP
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx(
      'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow',
      isCompleted && 'opacity-60',
      isOverdue && 'border-red-300 dark:border-red-700'
    )}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <button
              onClick={() => handleStatusChange(isCompleted ? 'Todo' : 'Done')}
              disabled={isLoading}
              className={clsx(
                'mt-1 w-5 h-5 rounded border-2 flex items-center justify-center',
                isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
              )}
            >
              {isCompleted && (
                <CheckCircleIcon className="w-3 h-3" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className={clsx(
                  'text-lg font-medium text-gray-900 dark:text-white truncate',
                  isCompleted && 'line-through'
                )}>
                  {task.title}
                </h3>
                <div className="flex items-center space-x-2 ml-2">
                  <span className={clsx(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    getPriorityColor(task.priority)
                  )}>
                    {task.priority}
                  </span>
                  <span className={clsx(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(task.status)
                  )}>
                    {task.status}
                  </span>
                </div>
              </div>

              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mb-3">
                {task.due_date && (
                  <div className={clsx(
                    'flex items-center text-xs',
                    isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    Due {format(new Date(task.due_date), 'MMM d, yyyy')}
                  </div>
                )}
                {task.area && (
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <TagIcon className="w-3 h-3 mr-1" />
                    {task.area}
                  </div>
                )}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center space-x-1">
                    {task.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{task.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <StarIcon className="w-4 h-4 mr-1 text-yellow-500" />
                    <span className="font-medium">{task.estimated_xp} XP</span>
                  </div>
                  {task.completed_at && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      Completed {format(new Date(task.completed_at), 'MMM d, h:mm a')}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {task.status === 'Todo' && (
                    <button
                      onClick={() => handleStatusChange('In Progress')}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                    >
                      <PlayIcon className="w-3 h-3 mr-1" />
                      Start
                    </button>
                  )}
                  {!isCompleted && (
                    <button
                      onClick={() => handleStatusChange('Done')}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <MoreHorizontalIcon className="w-4 h-4" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  <Link
                    href={`/tasks/${task.id}`}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowDropdown(false)}
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/tasks/${task.id}/edit`}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setShowDropdown(false)}
                  >
                    Edit Task
                  </Link>
                  <button
                    onClick={() => {
                      handleDelete()
                      setShowDropdown(false)
                    }}
                    disabled={isLoading}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                  >
                    Delete Task
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}