# Gamified Productivity Web App - Implementation Plan

## Overview
Building a full-stack Next.js 14 + Supabase productivity application that combines Notion-style task management with gamification elements including XP, levels, achievements, leaderboards, and social features. The app will be deployable as a PWA on Android and desktop platforms.

## Current State Analysis
**Repository:** system0/gamified-system-main/
**Current Setup:** Basic Next.js 16 + React 19 + Tailwind CSS 4 starter project
- Standard create-next-app structure with App Router
- TypeScript configuration enabled
- Tailwind CSS with dark mode support
- No external dependencies beyond basic Next.js stack
- No authentication, database, or state management currently implemented

## Desired End State
A complete gamified productivity platform with:
- User authentication (Supabase Auth with email/password + OAuth)
- Task management system with priorities, due dates, recurring tasks
- Habit tracking with streaks and visual progress
- Goal/project management with milestone tracking
- XP and leveling system with achievements
- Global and friends leaderboards
- Reward shop with virtual currency
- Responsive design working as PWA
- Offline capabilities with data sync

---

## Repo: system0

### Phase 1: Infrastructure & Authentication Setup

#### Dependencies Installation
**File:** system0/gamified-system-main/package.json
**Purpose:** Add required dependencies for the full application stack
**Changes:**
Add to dependencies:
- @supabase/supabase-js (Supabase client)
- @supabase/auth-helpers-nextjs (Auth helpers)
- @tanstack/react-query (Data fetching and caching)
- zustand (State management)
- @hookform/resolvers (Form validation)
- react-hook-form (Form handling)
- zod (Schema validation)
- date-fns (Date utilities)
- lucide-react (Icons)
- clsx (Utility classes)
- tailwind-merge (Tailwind class merging)

**File:** system0/gamified-system-main/.env.local (new file)
**Purpose:** Environment variables configuration
**Implementation:**
```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Gamified Productivity"

# OAuth Providers (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```

#### Supabase Integration Setup
**File:** system0/gamified-system-main/src/lib/supabase.ts (new file)
**Purpose:** Supabase client initialization and configuration
**Implementation:**
- Initialize Supabase client with environment variables
- Configure auth persistence with localStorage
- Export typed Supabase client for use throughout app
- Set up auth state change listener

**File:** system0/gamified-system-main/src/lib/supabase-admin.ts (new file)
**Purpose:** Admin Supabase client for server-side operations
**Implementation:**
- Initialize Supabase client with service role key (server-only)
- Use for admin operations like user management, bulk operations
- Export as adminClient to distinguish from client usage

#### Authentication System
**File:** system0/gamified-system-main/src/middleware.ts (new file)
**Purpose:** Route protection and auth middleware
**Implementation:**
- Protect authenticated routes (/dashboard, /tasks, /habits, etc.)
- Redirect unauthenticated users to /auth/login
- Handle auth callback redirects properly
- Allow public access to auth pages and home page

**File:** system0/gamified-system-main/src/app/auth/login/page.tsx (new file)
**Purpose:** User login interface with email/password and OAuth options
**UI Specification:**
- Centered login card on mobile (max-width: 400px)
- Full-screen layout on desktop with side illustration
- Email input with validation (email format required)
- Password input with show/hide toggle
- "Continue with Email" button (full width, primary styling)
- Social login buttons: Google, GitHub (if configured)
- "Don't have an account? Sign up" link
- "Forgot password?" link
- Loading state during authentication
- Error messages displayed inline below form
- Remember me checkbox (optional)

**File:** system0/gamified-system-main/src/app/auth/signup/page.tsx (new file)
**Purpose:** User registration with email verification
**UI Specification:**
- Similar layout to login page
- Email input (required, validated format)
- Password input (min 8 chars, show strength indicator)
- Confirm password input (must match password)
- Username input (optional, unique, 3-20 chars)
- "Create Account" button
- Terms of service checkbox (required)
- Email verification notice after successful signup
- Link to login page for existing users

**File:** system0/gamified-system-main/src/app/auth/forgot-password/page.tsx (new file)
**Purpose:** Password reset flow
**UI Specification:**
- Simple centered card layout
- Email input only
- "Send Reset Link" button
- Success message: "Check your email for reset instructions"
- Return to login link

**File:** system0/gamified-system-main/src/hooks/useAuth.ts (new file)
**Purpose:** Authentication state management hook
**Implementation:**
- Use Supabase auth state listener
- Provide user, loading, error states
- Login function (email/password)
- Signup function (email/password)
- OAuth login functions (Google, GitHub)
- Logout function
- Password reset function
- Email verification resend function

#### Database Schema Setup
**File:** system0/gamified-system-main/supabase/migrations/001_initial_schema.sql (new file)
**Purpose:** Create all database tables and relationships
**Implementation:**
```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  coins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')) DEFAULT 'Medium',
  status TEXT CHECK (status IN ('Todo', 'In Progress', 'Done')) DEFAULT 'Todo',
  due_date DATE,
  tags TEXT[],
  area TEXT,
  estimated_xp INTEGER DEFAULT 10,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence TEXT CHECK (recurrence IN ('daily', 'weekly', 'monthly')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habits table
CREATE TABLE public.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')) DEFAULT 'daily',
  xp_reward INTEGER DEFAULT 5,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habit logs table
CREATE TABLE public.habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

-- Goals table
CREATE TABLE public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Abandoned')) DEFAULT 'Not Started',
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goal tasks junction table
CREATE TABLE public.goal_tasks (
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (goal_id, task_id)
);

-- User stats table (for leaderboard caching)
CREATE TABLE public.user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  longest_habit_streak INTEGER DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  longest_active_days INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  requirement_type TEXT CHECK (requirement_type IN ('tasks', 'level', 'streak', 'xp', 'goals')) NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements junction table
CREATE TABLE public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Rewards table
CREATE TABLE public.rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cost_coins INTEGER NOT NULL,
  description TEXT,
  is_redeemed BOOLEAN DEFAULT FALSE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- XP transactions table
CREATE TABLE public.xp_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  reason TEXT CHECK (reason IN ('task_complete', 'habit_complete', 'achievement', 'daily_bonus', 'challenge', 'goal_complete')) NOT NULL,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friends table
CREATE TABLE public.friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id_1 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id_2 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id_1, user_id_2)
);

-- Daily challenges table
CREATE TABLE public.daily_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_date DATE UNIQUE NOT NULL,
  task_target INTEGER NOT NULL,
  habit_target INTEGER NOT NULL,
  xp_target INTEGER NOT NULL,
  coin_reward INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User challenge progress table
CREATE TABLE public.user_challenge_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  tasks_completed INTEGER DEFAULT 0,
  habits_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks policies (users can only access their own tasks)
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (user_id = auth.uid());

-- Habits policies
CREATE POLICY "Users can view own habits" ON public.habits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own habits" ON public.habits FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own habits" ON public.habits FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own habits" ON public.habits FOR DELETE USING (user_id = auth.uid());

-- Similar RLS policies for all other tables...
```

#### State Management Setup
**File:** system0/gamified-system-main/src/store/index.ts (new file)
**Purpose:** Global state management using Zustand
**Implementation:**
- User state management (profile, auth status)
- Task state management (tasks list, filters, loading)
- Habit state management (habits list, streak data)
- Goal state management (goals list, progress)
- XP and level state management
- Achievement state management
- UI state management (modals, sidebars, theme)

**File:** system0/gamified-system-main/src/hooks/useSupabaseQuery.ts (new file)
**Purpose:** Custom hook for Supabase queries with React Query
**Implementation:**
- Wrapper around useQuery for Supabase operations
- Automatic loading states and error handling
- Cache invalidation strategies
- Real-time subscriptions for data changes

---

### Phase 2: Core Features Implementation

#### Task Management System

**File:** system0/gamified-system-main/src/app/tasks/page.tsx (new file)
**Purpose:** Main task list interface with filtering and sorting
**UI Specification:**
- Mobile: Single column layout with bottom sheet for filters
- Desktop: Table view with sidebar filters
- Top bar: "Tasks" title, search input, filter button, add task button
- Task cards/list items showing:
  - Title (bold, clickable)
  - Priority indicator (High=red, Medium=yellow, Low=green)
  - Due date (if exists, with overdue highlighting)
  - Status badge (Todo, In Progress, Done)
  - Tags/area labels (if exist)
  - Estimated XP value
  - Checkbox for quick completion
- Empty state: "No tasks found" with create button
- Loading skeleton during data fetch
- Pull-to-refresh on mobile

**File:** system0/gamified-system-main/src/app/tasks/new/page.tsx (new file)
**Purpose:** Create new task interface
**UI Specification:**
- Full-screen modal on mobile, slide-out panel on desktop
- Form fields:
  - Title (required, autofocus)
  - Description (textarea, optional)
  - Priority dropdown (High/Medium/Low)
  - Status dropdown (Todo/In Progress/Done)
  - Due date picker with time
  - Tags/area input (comma-separated, autocomplete)
  - Estimated XP (number input, default based on priority)
  - Recurring task toggle (daily/weekly/monthly)
- Save and Cancel buttons
- Validation: Title required, due date cannot be in past
- Auto-save draft to localStorage

**File:** system0/gamified-system-main/src/app/tasks/[id]/page.tsx (new file)
**Purpose:** Task detail and edit interface
**UI Specification:**
- Header: Task title, back button, edit/delete buttons
- Task details display:
  - Description (formatted with line breaks)
  - Priority badge with color
  - Status with progression options
  - Due date with countdown
  - Tags and area
  - XP value awarded upon completion
  - Created/updated dates
- Edit mode: Same form as creation, pre-filled
- Action buttons:
  - Complete task (with XP animation)
  - Mark in progress
  - Delete task (with confirmation)
- Related tasks/notes section (future feature)

**File:** system0/gamified-system-main/src/components/TaskCard.tsx (new file)
**Purpose:** Reusable task card component
**Implementation:**
- Accept task props: id, title, description, priority, status, dueDate, tags, xp
- Priority color coding and icons
- Due date formatting and overdue states
- Completion checkbox with optimistic updates
- Click to navigate to task detail
- Swipe actions on mobile (complete/archive/delete)

#### Habit Tracking System

**File:** system0/gamified-system-main/src/app/habits/page.tsx (new file)
**Purpose:** Habit list with streak tracking
**UI Specification:**
- Grid layout on mobile (2-3 habits per row)
- List layout on desktop with detailed info
- Each habit card shows:
  - Habit name (large text)
  - Current streak (number with fire icon)
  - Longest streak (smaller text)
  - 7-day completion heatmap (small calendar grid)
  - Quick check-in button (large, primary color)
  - XP reward value
- "Check in all" button for multiple habits
- Statistics summary: Total habits, active streaks, XP from habits today
- Empty state: "Create your first habit" with guidance

**File:** system0/gamified-system-main/src/app/habits/new/page.tsx (new file)
**Purpose:** Create new habit interface
**UI Specification:**
- Clean, focused form
- Fields:
  - Habit name (required, e.g., "Morning Meditation")
  - Frequency selector (Daily/Weekly/Monthly)
  - XP reward (suggested based on frequency)
  - Time of day reminder (optional)
- Preview of how habit will appear
- Success message with next step advice
- Navigation to habit detail after creation

**File:** system0/gamified-system-main/src/app/habits/[id]/page.tsx (new file)
**Purpose:** Individual habit detail with history
**UI Specification:**
- Large habit name with completion percentage
- Streak information: Current, longest, best month
- Calendar view showing completion history (heat map)
- Today's check-in button (prominent)
- Statistics: Completion rate, average streak, total completions
- Edit/Delete options
- Linked tasks or goals (future feature)
- Motivational messages based on streak length

**File:** system0/gamified-system-main/src/components/HabitHeatmap.tsx (new file)
**Purpose:** 7-day streak visualization
**Implementation:**
- Grid of 7 squares (Sun-Sat)
- Color coding: No data=gray, Missed=red, Complete=green
- Current day indicator
- Tooltip on hover showing date and status
- Compact size for habit cards
- Animated completion state changes

#### Goals & Projects Management

**File:** system0/gamified-system-main/src/app/goals/page.tsx (new file)
**Purpose:** Goals overview with progress tracking
**UI Specification:**
- Card-based layout showing all goals
- Each goal card:
  - Goal title and brief description
  - Progress bar with percentage
  - Status badge (Not Started/In Progress/Completed/Abandoned)
  - Due date with countdown
  - Linked tasks count
  - Priority indicator
- Sort options: By due date, by progress, by creation date
- Filter options: By status, by priority
- Create new goal button
- Goals summary widget: Total goals, completion rate

**File:** system0/gamified-system-main/src/app/goals/new/page.tsx (new file)
**Purpose:** Goal creation interface
**UI Specification:**
- Form with goal details:
  - Goal title (required)
  - Description (optional, rich text)
  - Due date picker
  - Initial progress percentage
  - Priority level
- Task linking section:
  - Search existing tasks
  - Create new tasks directly
  - Multi-select with autocomplete
- Milestone planning (future feature)
- Save and create another option
- Validation: Title required, due date not in past

#### Dashboard Overview

**File:** system0/gamified-system-main/src/app/dashboard/page.tsx (new file)
**Purpose:** Main dashboard with overview of all systems
**UI Specification:**
- Mobile: Vertical scroll layout
- Desktop: Multi-column layout with sidebar
- Header: User greeting, level/XP progress bar, coins balance
- Today's tasks section: Top 3-5 tasks for today
- Habit check-in section: All habits for today with quick check-ins
- Goals progress widget: Active goals with progress bars
- XP earned today with breakdown (tasks vs habits)
- Achievement progress: Next achievement to unlock
- Leaderboard position preview
- Daily challenge status
- Quick action buttons: Add task, create habit, new goal

---

### Phase 3: Gamification System Implementation

#### XP & Leveling System

**File:** system0/gamified-system-main/src/lib/xp-system.ts (new file)
**Purpose:** XP calculation and level progression logic
**Implementation:**
```typescript
// XP calculation rules
export const XP_REWARDS = {
  TASK_HIGH: 50,
  TASK_MEDIUM: 30,
  TASK_LOW: 10,
  HABIT_DAILY: 20,
  HABIT_WEEKLY: 15,
  HABIT_MONTHLY: 10,
  MILESTONE_COMPLETE: 100,
  DAILY_BONUS: 5,
  CHALLENGE_COMPLETE: 100,
  GOAL_COMPLETE: 200
};

// Level calculation (non-linear after level 10)
export const calculateLevel = (totalXp: number): number => {
  if (totalXp < 1000) return Math.floor(totalXp / 100);
  // Non-linear scaling: level = 10 + log2(xp/1000)
  return 10 + Math.floor(Math.log2(totalXp / 1000));
};

export const xpForNextLevel = (currentLevel: number): number => {
  if (currentLevel < 10) return (currentLevel + 1) * 100;
  return 1000 * Math.pow(2, currentLevel - 9);
};
```

**File:** system0/gamified-system-main/src/hooks/useXpSystem.ts (new file)
**Purpose:** XP transactions and level management
**Implementation:**
- Award XP function (task completion, habit check-in)
- Level up detection and celebration
- XP history tracking
- Coin conversion (1 XP = 1 coin)
- Transaction logging for audit trail

**File:** system0/gamified-system-main/src/components/LevelProgressBar.tsx (new file)
**Purpose:** Visual level and XP progress display
**UI Specification:**
- Horizontal progress bar showing current level progress
- Current level badge with icon
- XP points: "1,250 / 1,500 XP"
- Percentage to next level
- Animated fill when XP gained
- Level up celebration animation

**File:** system0/gamified-system-main/src/components/XpAnimation.tsx (new file)
**Purpose:** XP gain animation for user feedback
**Implementation:**
- Floating "+50 XP" animation upward
- Different colors based on XP amount
- Stacking multiple XP gains
- Sound effects (optional)
- Haptic feedback on mobile

#### Achievements System

**File:** system0/gamified-system-main/src/lib/achievements.ts (new file)
**Purpose:** Achievement definitions and unlock logic
**Implementation:**
```typescript
export const ACHIEVEMENTS = [
  {
    id: 'first_task',
    title: 'First Task',
    description: 'Complete your first task',
    icon: 'check-circle',
    requirement_type: 'tasks',
    requirement_value: 1
  },
  {
    id: 'task_master',
    title: 'Task Master',
    description: 'Complete 50 tasks',
    icon: 'trophy',
    requirement_type: 'tasks',
    requirement_value: 50
  },
  {
    id: 'century',
    title: 'Century',
    description: 'Complete 100 tasks',
    icon: 'medal',
    requirement_type: 'tasks',
    requirement_value: 100
  },
  {
    id: 'habit_builder',
    title: 'Habit Builder',
    description: 'Create your first habit',
    icon: 'repeat',
    requirement_type: 'habits_created',
    requirement_value: 1
  },
  {
    id: 'consistency_streak',
    title: 'Consistency Streak',
    description: 'Maintain a 7-day habit streak',
    icon: 'fire',
    requirement_type: 'streak',
    requirement_value: 7
  },
  {
    id: 'iron_habit',
    title: 'Iron Habit',
    description: 'Maintain a 30-day habit streak',
    icon: 'flame',
    requirement_type: 'streak',
    requirement_value: 30
  },
  {
    id: 'level_5',
    title: 'Level 5',
    description: 'Reach level 5',
    icon: 'star',
    requirement_type: 'level',
    requirement_value: 5
  },
  {
    id: 'level_10',
    title: 'Level 10',
    description: 'Reach level 10',
    icon: 'award',
    requirement_type: 'level',
    requirement_value: 10
  },
  {
    id: 'level_25',
    title: 'Level 25',
    description: 'Reach level 25',
    icon: 'crown',
    requirement_type: 'level',
    requirement_value: 25
  },
  {
    id: 'coin_collector',
    title: 'Coin Collector',
    description: 'Earn 500 coins',
    icon: 'coins',
    requirement_type: 'coins',
    requirement_value: 500
  },
  {
    id: 'goal_setter',
    title: 'Goal Setter',
    description: 'Create your first goal',
    icon: 'target',
    requirement_type: 'goals_created',
    requirement_value: 1
  },
  {
    id: 'goal_crusher',
    title: 'Goal Crusher',
    description: 'Complete 5 goals',
    icon: 'target',
    requirement_type: 'goals',
    requirement_value: 5
  },
  {
    id: 'weekly_warrior',
    title: 'Weekly Warrior',
    description: 'Complete tasks for 7 consecutive days',
    icon: 'calendar',
    requirement_type: 'active_days',
    requirement_value: 7
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a task between 9 PM - 6 AM',
    icon: 'moon',
    requirement_type: 'night_task',
    requirement_value: 1
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a task between 5 AM - 9 AM',
    icon: 'sun',
    requirement_type: 'morning_task',
    requirement_value: 1
  }
];
```

**File:** system0/gamified-system-main/src/hooks/useAchievements.ts (new file)
**Purpose:** Achievement checking and unlocking logic
**Implementation:**
- Check achievements after each XP-earning action
- Queue achievement notifications
- Track progress toward next achievements
- Show percentage progress for incomplete achievements

**File:** system0/gamified-system-main/src/components/AchievementNotification.tsx (new file)
**Purpose:** Achievement unlock celebration UI
**UI Specification:**
- Modal/popup with achievement icon
- "Achievement Unlocked!" title
- Achievement name and description
- XP bonus reward display
- Share button (optional)
- Dismiss button
- Confetti animation or celebration effect

#### Rewards & Shop System

**File:** system0/gamified-system-main/src/app/shop/page.tsx (new file)
**Purpose:** Virtual reward shop interface
**UI Specification:**
- Header: Coin balance with refresh button
- Categories: Personal Rewards, Entertainment, Food, Activities
- Reward cards:
  - Reward title and description
  - Cost in coins
  - Redeem button (disabled if insufficient coins)
  - Times redeemed counter
  - Custom reward creation option
- "Create Custom Reward" button
- Transaction history section
- Empty state: "Create your first reward"

**File:** system0/gamified-system-main/src/app/shop/new/page.tsx (new file)
**Purpose:** Create custom reward interface
**UI Specification:**
- Form fields:
  - Reward title (required)
  - Description (optional)
  - Cost in coins (number input, minimum 10)
  - Category selection
  - Icon selection from library
- Preview of reward card
- Save button
- Validation: Title required, minimum cost 10 coins

**File:** system0/gamified-system-main/src/components/CoinBalance.tsx (new file)
**Purpose:** Coin balance display component
**UI Specification:**
- Coin icon with balance number
- Animated number changes when coins earned/spent
- "Earn coins" call-to-action when balance low
- Click to view transaction history

#### Daily Challenges System

**File:** system0/gamified-system-main/src/lib/challenges.ts (new file)
**Purpose:** Daily challenge generation and tracking
**Implementation:**
- Generate procedural daily challenges
- Challenge templates: task count, habit count, XP targets
- Challenge reset at midnight UTC
- Weekly challenge generation on Mondays
- Progress tracking throughout the day

**File:** system0/gamified-system-main/src/components/DailyChallengeCard.tsx (new file)
**Purpose:** Daily challenge progress display
**UI Specification:**
- Challenge title and description
- Progress bar showing completion percentage
- Individual progress items: Tasks (3/5), Habits (1/2), XP (75/100)
- Reward display: XP + coins
- Time remaining until reset
- Celebration animation on completion

---

### Phase 4: Social Features Implementation

#### Leaderboards System

**File:** system0/gamified-system-main/src/app/leaderboard/page.tsx (new file)
**Purpose:** Global leaderboard display
**UI Specification:**
- Time filter tabs: All Time / This Month / This Week
- Search bar for finding specific users
- Leaderboard table with columns:
  - Rank (1, 2, 3 with medals, others with numbers)
  - User avatar (40px circle)
  - Username (or display name)
  - Level with badge
  - Total XP
  - Longest streak
  - Tasks completed
- User's own row highlighted
- Load more pagination (100 users max)
- Refresh button
- Empty state for filters with no results

**File:** system0/gamified-system-main/src/app/leaderboard/friends/page.tsx (new file)
**Purpose:** Friends-only leaderboard
**UI Specification:**
- Similar to global leaderboard but limited to friends
- "No friends yet" state with add friends button
- Friend count indicator
- Ability to compare stats with specific friends

**File:** system0/gamified-system-main/src/lib/leaderboard-cache.ts (new file)
**Purpose:** Leaderboard performance optimization
**Implementation:**
- Materialized view or scheduled job for leaderboard ranking
- Cache frequent leaderboard queries
- Real-time updates for top 100 users
- Efficient database queries with proper indexing

#### Friends System

**File:** system0/gamified-system-main/src/app/friends/page.tsx (new file)
**Purpose:** Friends management interface
**UI Specification:**
- Tabs: Friends, Pending Requests, Find Friends
- Friends list: Avatar, username, level, online status, compare button
- Pending requests: Accept/Decline buttons
- Find friends: Search by email or username, send request button
- Friend count display
- Empty states with appropriate messaging

**File:** system0/gamified-system-main/src/components/FriendRequestCard.tsx (new file)
**Purpose:** Individual friend request display
**UI Specification:**
- User avatar and info
- Request date
- Accept and Decline buttons
- Mutual friends count (if applicable)

**File:** system0/gamified-system-main/src/lib/friend-requests.ts (new file)
**Purpose:** Friend request logic and notifications
**Implementation:**
- Send friend request function
- Accept/decline friend request functions
- Friend suggestion algorithm (based on similar levels/activity)
- Notification system for friend activities

---

### Phase 5: UI Polish & PWA Features

#### Responsive Design Implementation

**File:** system0/gamified-system-main/src/components/Navigation.tsx (new file)
**Purpose:** Adaptive navigation for different screen sizes
**UI Specification:**
- Mobile (< 768px): Bottom navigation bar
  - Fixed position bottom: 0
  - 5 tabs: Dashboard, Tasks, Habits, Leaderboard, Profile
  - Active tab indicator with accent color
  - Icons only, with optional labels
- Desktop (≥ 768px): Sidebar navigation
  - Collapsible sidebar (280px width)
  - Full text labels with icons
  - User profile section at top
  - Navigation groups with dividers
  - Expand/collapse button

**File:** system0/gamified-system-main/src/app/layout.tsx
**Purpose:** Root layout with PWA configuration
**Changes:**
- Add theme provider for dark/light mode
- Add responsive viewport meta tag
- Add PWA manifest link
- Add service worker registration
- Add error boundaries
- Add loading states

#### Mobile-First UI Components

**File:** system0/gamified-system-main/src/components/ui/MobileModal.tsx (new file)
**Purpose:** Full-screen modal for mobile interactions
**UI Specification:**
- Full viewport height on mobile
- Slide-up animation from bottom
- Header with title and close button
- Scrollable content area
- Action buttons fixed to bottom
- Backdrop blur effect
- Swipe down to dismiss gesture

**File:** system0/gamified-system-main/src/components/ui/TouchTarget.tsx (new file)
**Purpose:** Large touch targets for mobile usability
**Implementation:**
- Minimum 48px touch targets
- Visual feedback on touch
- Haptic feedback integration
- Proper spacing between touch targets

#### PWA Configuration

**File:** system0/gamified-system-main/public/manifest.json (new file)
**Purpose:** PWA manifest configuration
**Implementation:**
```json
{
  "name": "Gamified Productivity",
  "short_name": "Productivity",
  "description": "Gamified task and habit tracking app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**File:** system0/gamified-system-main/public/sw.js (new file)
**Purpose:** Service worker for offline functionality
**Implementation:**
- Cache-first strategy for static assets
- Network-first strategy for API calls
- Offline queue for XP transactions
- Background sync for data synchronization
- Push notification support (future)

**File:** system0/gamified-system-main/src/lib/offline-queue.ts (new file)
**Purpose:** Offline data synchronization
**Implementation:**
- Queue user actions when offline
- Store in IndexedDB for persistence
- Sync queued actions when connection restored
- Conflict resolution for simultaneous edits
- Visual indicator for offline/syncing status

#### Theme System

**File:** system0/gamified-system-main/src/components/ThemeProvider.tsx (new file)
**Purpose:** Dark/light mode theme management
**Implementation:**
- System preference detection
- Manual theme toggle
- Theme persistence in localStorage
- Smooth transitions between themes
- Respects user's OS preference by default

#### Performance Optimization

**File:** system0/gamified-system-main/src/hooks/useInfiniteQuery.ts (new file)
**Purpose:** Infinite scrolling for large data sets
**Implementation:**
- Pagination for tasks, habits, leaderboard
- Optimistic updates for better UX
- Proper cache invalidation strategies
- Skeleton loading states

**File:** system0/gamified-system-main/src/lib/image-optimization.ts (new file)
**Purpose:** Avatar and image optimization
**Implementation:**
- WebP format support with fallbacks
- Responsive image sizes
- Lazy loading for user avatars
- Compression for profile images

---

### Phase 6: Deployment & Production Setup

#### Environment Configuration

**File:** system0/gamified-system-main/.env.example (new file)
**Purpose:** Environment variables template
**Implementation:**
- All required environment variables documented
- Default values for development
- Production-specific notes
- Security considerations for sensitive values

#### Vercel Deployment Setup

**File:** system0/gamified-system-main/vercel.json (new file)
**Purpose:** Vercel deployment configuration
**Implementation:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_APP_URL": "@app-url"
  }
}
```

#### Database Production Setup

**File:** system0/gamified-system-main/supabase/production-setup.sql (new file)
**Purpose:** Production database configuration
**Implementation:**
- Production-specific database indexes
- Row Level Security policies review
- Database backup configuration
- Monitoring and logging setup
- Connection pooling configuration

#### Monitoring & Analytics

**File:** system0/gamified-system-main/src/lib/analytics.ts (new file)
**Purpose:** Usage analytics and error tracking
**Implementation:**
- Privacy-focused analytics (no personal data)
- Error tracking and reporting
- Performance metrics collection
- User behavior analysis (aggregated)

---

## Technical Implementation Details

### Error Handling Strategy

**Global Error Boundaries:**
- React Error Boundary for component errors
- API route error handling with proper HTTP status codes
- Database operation error handling with user-friendly messages
- Network error handling with retry logic

**User Feedback:**
- Toast notifications for success/error states
- Inline validation errors in forms
- Loading states for all async operations
- Offline mode indicators

### Security Considerations

**Authentication Security:**
- Email verification required before account activation
- Password strength requirements (minimum 8 chars)
- Rate limiting on login attempts
- Session management with proper expiration

**Data Security:**
- Row Level Security (RLS) on all database tables
- Input validation and sanitization
- SQL injection prevention through parameterized queries
- XSS prevention through proper data escaping

**API Security:**
- CORS configuration for API routes
- Rate limiting on API endpoints
- Input validation on all API inputs
- Proper HTTP status codes for different error types

### Performance Optimizations

**Database Optimization:**
- Proper indexing on frequently queried columns
- Materialized views for leaderboard data
- Database connection pooling
- Query optimization for large data sets

**Frontend Optimization:**
- Code splitting for route-based chunks
- Image optimization and lazy loading
- Efficient state management with proper memoization
- Bundle size optimization

**Caching Strategy:**
- React Query for API response caching
- Service worker caching for static assets
- Browser caching for static resources
- CDN integration for global performance

### Testing Strategy

**Unit Tests:**
- Utility functions (XP calculations, achievement logic)
- Custom hooks testing
- Component unit tests with React Testing Library
- API route testing

**Integration Tests:**
- Database operation testing
- Authentication flow testing
- API endpoint testing with real database
- Component integration testing

**E2E Tests:**
- Critical user journeys (signup, task completion, level up)
- Cross-browser compatibility testing
- Mobile responsiveness testing
- PWA installation and offline functionality

### Accessibility Features

**WCAG 2.1 AA Compliance:**
- Semantic HTML structure
- Proper heading hierarchy
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

**Mobile Accessibility:**
- Proper touch target sizes (minimum 48px)
- Voice-over/TalkBack support
- Zoom and pinch-to-zoom support
- Orientation support

---

## Success Metrics & Verification

### Core Functionality Verification

**User Journey Testing:**
1. **Complete Signup Flow:**
   - User can create account with email/password
   - Email verification works correctly
   - User is logged in and redirected to dashboard

2. **Task Management:**
   - User can create, edit, complete, and delete tasks
   - Task filtering and sorting works correctly
   - XP is awarded properly on task completion

3. **Habit Tracking:**
   - User can create habits and check in daily
   - Streak calculation works correctly
   - Habit history displays accurately

4. **Gamification Elements:**
   - XP system calculates levels correctly
   - Achievements unlock at appropriate thresholds
   - Leaderboard updates reflect user activity

5. **Social Features:**
   - Friend requests work bidirectionally
   - Leaderboard displays correct rankings
   - User can view friend-specific leaderboards

### Performance Requirements

**Page Load Times:**
- First Contentful Paint: < 1.5 seconds
- Largest Contentful Paint: < 2.5 seconds
- Time to Interactive: < 3 seconds

**Mobile Performance:**
- Touch responsiveness: < 100ms
- PWA installation: < 5 seconds
- Offline functionality: Core features work immediately

**Database Performance:**
- Leaderboard queries: < 2 seconds
- User dashboard load: < 1 second
- Task/habit operations: < 500ms

### PWA Requirements Verification

**Installation:**
- App installs successfully on Android
- App appears in home screen with custom icon
- App launches in standalone mode

**Offline Functionality:**
- Core features (viewing tasks/habits) work offline
- Actions queue properly and sync on reconnection
- Offline indicator displays correctly

**Push Notifications:**
- User can grant notification permissions
- Daily challenge reminders work
- Achievement unlock notifications display

### Security Verification

**Authentication Security:**
- Password strength enforced
- Account verification required
- Session management works correctly
- Logout invalidates sessions properly

**Data Security:**
- Users can only access their own data
- API endpoints properly protected
- Input validation prevents injection attacks
- CORS policies restrict unauthorized access

### Cross-Platform Compatibility

**Browser Support:**
- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest 2 versions)
- Edge (latest)

**Mobile Support:**
- Android Chrome (latest)
- iOS Safari (latest 2 versions)
- Responsive design works 320px - 1920px
- Touch interactions work correctly

**Device Support:**
- Desktop: Windows, macOS, Linux
- Mobile: Android 8+, iOS 13+
- Tablet: iPadOS, Android tablets

### User Experience Verification

**Onboarding Experience:**
- New user tutorial completes successfully
- Core features explained intuitively
- User can complete first task within 5 minutes

**Accessibility Testing:**
- Screen reader navigation works
- Keyboard-only navigation possible
- Color contrast meets WCAG standards
- Touch targets meet minimum size requirements

**Error Handling:**
- Network errors display user-friendly messages
- Form validation provides clear guidance
- Offline mode handles gracefully
- Conflicts resolved appropriately

---

## Deployment Checklist

### Pre-Deployment Preparation

**Code Quality:**
- [ ] All TypeScript errors resolved
- [ ] ESLint passes without warnings
- [ ] Code review completed for all changes
- [ ] Documentation updated for new features

**Testing:**
- [ ] Unit tests pass (>90% coverage)
- [ ] Integration tests pass
- [ ] E2E tests pass for critical flows
- [ ] Performance tests meet requirements
- [ ] Security tests pass

**Database:**
- [ ] Production schema created
- [ ] RLS policies reviewed and tested
- [ ] Database indexes optimized
- [ ] Backup strategy implemented
- [ ] Migration scripts tested

### Production Deployment

**Environment Setup:**
- [ ] Supabase project created and configured
- [ ] Environment variables set in Vercel
- [ ] Domain configured with SSL
- [ ] CDN configured for static assets

**Monitoring Setup:**
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Database monitoring set up
- [ ] User analytics configured

**Final Verification:**
- [ ] Production build successful
- [ ] All routes accessible
- [ ] Authentication flow works
- [ ] Database connections successful
- [ ] PWA features functional
- [ ] Mobile responsiveness verified

### Post-Deployment

**Monitoring:**
- [ ] Error rates monitored
- [ ] Performance metrics tracked
- [ ] User engagement measured
- [ ] Database performance monitored

**Maintenance:**
- [ ] Regular security updates
- [ ] Database backups verified
- [ ] Performance optimizations ongoing
- [ ] User feedback collection system
