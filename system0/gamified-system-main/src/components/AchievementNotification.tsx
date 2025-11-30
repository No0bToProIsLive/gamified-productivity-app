'use client'

import { useEffect, useState } from 'react'
import {
  TrophyIcon,
  SparklesIcon,
  CheckCircleIcon,
  Share2Icon,
  XMarkIcon
} from 'lucide-react'
import { getAchievementRarity, getAchievementColor, getAchievementNotificationDuration } from '@/lib/achievements'
import { useAppStore } from '@/store'
import { clsx } from 'clsx'

interface AchievementNotificationProps {
  achievement: {
    id: string
    title: string
    description: string
    icon_url?: string
    requirement_type: string
    requirement_value: number
    xp_reward: number
  }
  onClose: () => void
  autoClose?: boolean
}

export function AchievementNotification({
  achievement,
  onClose,
  autoClose = true
}: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timeout = setTimeout(() => {
      setIsVisible(true)
      setShowConfetti(true)
    }, 100)

    if (autoClose) {
      const duration = getAchievementNotificationDuration(achievement)
      const closeTimeout = setTimeout(() => {
        handleClose()
      }, duration)

      return () => {
        clearTimeout(timeout)
        clearTimeout(closeTimeout)
      }
    }

    return () => clearTimeout(timeout)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 300)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Achievement Unlocked!',
          text: `Just unlocked "${achievement.title}" in Gamified Productivity!`,
        })
      } catch (error) {
        // Fallback to copying to clipboard
        copyToClipboard()
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    const text = `Just unlocked "${achievement.title}" in Gamified Productivity! ${achievement.description}`
    navigator.clipboard.writeText(text)
  }

  const rarity = getAchievementRarity(achievement.requirement_value)
  const colorClass = getAchievementColor(achievement)

  const getAchievementIcon = (iconUrl: string | undefined) => {
    if (iconUrl) {
      return <img src={iconUrl} alt={achievement.title} className="w-6 h-6" />
    }

    // Default icons based on icon_url or title
    if (achievement.icon_url?.includes('trophy') || achievement.title.toLowerCase().includes('master')) {
      return <TrophyIcon className="w-6 h-6" />
    }
    if (achievement.icon_url?.includes('star') || achievement.title.toLowerCase().includes('level')) {
      return <span className="text-2xl">⭐</span>
    }
    if (achievement.icon_url?.includes('fire') || achievement.title.toLowerCase().includes('streak')) {
      return <span className="text-2xl">🔥</span>
    }
    if (achievement.icon_url?.includes('check') || achievement.title.toLowerCase().includes('task')) {
      return <CheckCircleIcon className="w-6 h-6" />
    }
    if (achievement.icon_url?.includes('target') || achievement.title.toLowerCase().includes('goal')) {
      return <span className="text-2xl">🎯</span>
    }
    if (achievement.icon_url?.includes('coins') || achievement.title.toLowerCase().includes('coin')) {
      return <span className="text-2xl">🪙</span>
    }
    if (achievement.icon_url?.includes('calendar') || achievement.title.toLowerCase().includes('daily')) {
      return <span className="text-2xl">📅</span>
    }
    if (achievement.icon_url?.includes('moon') || achievement.title.toLowerCase().includes('night')) {
      return <span className="text-2xl">🌙</span>
    }
    if (achievement.icon_url?.includes('sun') || achievement.title.toLowerCase().includes('morning')) {
      return <span className="text-2xl">☀️</span>
    }

    return <TrophyIcon className="w-6 h-6" />
  }

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'Legendary':
        return 'Legendary'
      case 'Epic':
        return 'Epic'
      case 'Rare':
        return 'Rare'
      case 'Common':
      default:
        return 'Common'
    }
  }

  return (
    <>
      {/* Confetti overlay */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce" />
              <div className="absolute -top-2 -right-6 w-6 h-6 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="absolute top-0 -left-8 w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="absolute -bottom-2 -right-4 w-6 h-6 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              <div className="absolute -bottom-4 left-0 w-5 h-5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      <div
        className={clsx(
          'fixed top-4 right-4 z-50 max-w-sm transform transition-all duration-300 ease-out',
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        )}
      >
        <div className={clsx(
          'bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 p-4 relative overflow-hidden',
          colorClass
        )}>
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>

          {/* Rarity indicator */}
          <div className="flex items-center justify-between mb-3">
            <span className={clsx(
              'text-xs font-bold px-2 py-1 rounded-full',
              rarity === 'Legendary' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' :
              rarity === 'Epic' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' :
              rarity === 'Rare' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
              'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
            )}>
              {getRarityText(rarity)}
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-lg">🏆</span>
              <SparklesIcon className="w-4 h-4 text-yellow-500" />
            </div>
          </div>

          {/* Achievement icon and title */}
          <div className="flex items-start space-x-3">
            <div className={clsx(
              'flex items-center justify-center w-12 h-12 rounded-lg border-2',
              rarity === 'Legendary' ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400' :
              rarity === 'Epic' ? 'bg-gradient-to-br from-purple-500 to-indigo-500 border-purple-400' :
              rarity === 'Rare' ? 'bg-gradient-to-br from-blue-500 to-cyan-500 border-blue-400' :
              'bg-gradient-to-br from-gray-500 to-gray-600 border-gray-400',
              'text-white flex-shrink-0'
            )}>
              {getAchievementIcon(achievement.icon_url)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {achievement.title}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {achievement.description}
              </div>
            </div>
          </div>

          {/* XP reward */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">XP Bonus:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                +{achievement.xp_reward} XP
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Share2Icon className="w-3 h-3 mr-1" />
                Share
              </button>
              <button
                onClick={handleClose}
                className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md border border-transparent text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Awesome!
              </button>
            </div>
          </div>

          {/* Progress bar for context (optional) */}
          {achievement.requirement_value <= 10 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>Completed</span>
              </div>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Achievement celebration component for the page
export function AchievementCelebration({
  achievement,
  onDismiss
}: {
  achievement: {
    id: string
    title: string
    description: string
    icon_url?: string
    requirement_type: string
    requirement_value: number
    xp_reward: number
  }
  onDismiss: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 relative">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white">
              <TrophyIcon className="w-10 h-10" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Achievement Unlocked!
          </h2>

          <h3 className="text-xl font-medium text-blue-600 dark:text-blue-400 mb-2">
            {achievement.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {achievement.description}
          </p>

          <div className="flex items-center justify-center space-x-4 text-sm font-medium">
            <div className="flex items-center text-yellow-600 dark:text-yellow-400">
              <span className="text-lg mr-1">🪙</span>
              {achievement.xp_reward} XP
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="mt-6 w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}