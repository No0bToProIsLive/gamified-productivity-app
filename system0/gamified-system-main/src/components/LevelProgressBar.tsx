'use client'

import { useMemo } from 'react'
import { calculateLevel, xpForNextLevel, xpInCurrentLevel, levelProgress, getLevelColor } from '@/lib/xp-system'

interface LevelProgressBarProps {
  xp: number
  showLevel?: boolean
  showXP?: boolean
  compact?: boolean
}

export function LevelProgressBar({ xp, showLevel = true, showXP = true, compact = false }: LevelProgressBarProps) {
  const levelData = useMemo(() => {
    const currentLevel = calculateLevel(xp)
    const currentLevelXP = xpInCurrentLevel(xp)
    const nextLevelXP = xpForNextLevel(currentLevel) - (currentLevel > 1 ? xpForNextLevel(currentLevel - 1) : 0)
    const progress = levelProgress(xp)
    const levelColor = getLevelColor(currentLevel)

    return {
      currentLevel,
      currentLevelXP,
      nextLevelXP,
      progress,
      levelColor,
    }
  }, [xp])

  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${levelData.levelColor}`}>
            {levelData.currentLevel}
          </div>
        </div>
        <div className="flex-1">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${levelData.progress * 100}%` }}
            />
          </div>
        </div>
        {showXP && (
          <div className="text-xs text-gray-500 dark:text-gray-400 min-w-[60px] text-right">
            {Math.round(levelData.currentLevelXP)} / {levelData.nextLevelXP}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {showLevel && (
            <>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${levelData.levelColor}`}>
                {levelData.currentLevel}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Level {levelData.currentLevel}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {levelData.nextLevelXP - levelData.currentLevelXP} XP to next level
                </div>
              </div>
            </>
          )}
        </div>
        {showXP && (
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {xp.toLocaleString()} XP
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total earned
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Progress to Level {levelData.currentLevel + 1}</span>
          <span>{Math.round(levelData.progress * 100)}%</span>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500 h-3 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${levelData.progress * 100}%` }}
          >
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{Math.round(levelData.currentLevelXP)} XP</span>
          <span>{levelData.nextLevelXP} XP</span>
        </div>
      </div>
    </div>
  )
}