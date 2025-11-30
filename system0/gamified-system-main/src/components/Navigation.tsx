'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useSidebarOpen, useAppStore } from '@/store'
import {
  HomeIcon,
  CheckSquareIcon,
  RepeatIcon,
  TargetIcon,
  TrophyIcon,
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  UsersIcon
} from 'lucide-react'
import { clsx } from 'clsx'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    current: (pathname: string) => pathname === '/dashboard',
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: CheckSquareIcon,
    current: (pathname: string) => pathname.startsWith('/tasks'),
  },
  {
    name: 'Habits',
    href: '/habits',
    icon: RepeatIcon,
    current: (pathname: string) => pathname.startsWith('/habits'),
  },
  {
    name: 'Goals',
    href: '/goals',
    icon: TargetIcon,
    current: (pathname: string) => pathname.startsWith('/goals'),
  },
  {
    name: 'Leaderboard',
    href: '/leaderboard',
    icon: TrophyIcon,
    current: (pathname: string) => pathname.startsWith('/leaderboard'),
  },
  {
    name: 'Shop',
    href: '/shop',
    icon: ShoppingCartIcon,
    current: (pathname: string) => pathname.startsWith('/shop'),
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: UserIcon,
    current: (pathname: string) => pathname.startsWith('/profile'),
  },
] as const

export function Navigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const sidebarOpen = useSidebarOpen()
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(false) // Reset mobile state
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setSidebarOpen])

  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  // Desktop sidebar
  if (!isMobile) {
    return (
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                Gamified
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 rounded-md"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const isActive = item.current(pathname)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  <item.icon className={clsx(
                    'mr-3 h-5 w-5',
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500'
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                {user?.email?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.email?.split('@')[0]}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Level {user?.user_metadata?.level || 1}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mobile bottom navigation
  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out md:hidden',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                Gamified
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 rounded-md"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const isActive = item.current(pathname)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                  )}
                >
                  <item.icon className={clsx(
                    'mr-3 h-5 w-5',
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500'
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                {user?.email?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.email?.split('@')[0]}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Level {user?.user_metadata?.level || 1}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-5 gap-1">
          {navigationItems.slice(0, 5).map((item) => {
            const isActive = item.current(pathname)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center py-2 text-xs transition-colors',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                <item.icon className={clsx(
                  'h-5 w-5 mb-1',
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
                )} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}

// Hamburger menu button for mobile
export function MobileMenuButton() {
  const sidebarOpen = useSidebarOpen()
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)

  return (
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="md:hidden p-2 text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 rounded-md"
    >
      <Bars3Icon className="w-5 h-5" />
    </button>
  )
}