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

-- Habit logs policies
CREATE POLICY "Users can view own habit logs" ON public.habit_logs FOR SELECT USING (
  habit_id IN (SELECT id FROM public.habits WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert own habit logs" ON public.habit_logs FOR INSERT WITH CHECK (
  habit_id IN (SELECT id FROM public.habits WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own habit logs" ON public.habit_logs FOR DELETE USING (
  habit_id IN (SELECT id FROM public.habits WHERE user_id = auth.uid())
);

-- Goals policies
CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own goals" ON public.goals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (user_id = auth.uid());

-- Goal tasks policies
CREATE POLICY "Users can manage own goal tasks" ON public.goal_tasks FOR ALL USING (
  goal_id IN (SELECT id FROM public.goals WHERE user_id = auth.uid())
);

-- User stats policies
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own stats" ON public.user_stats FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (user_id = auth.uid());

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (user_id = auth.uid());

-- Rewards policies
CREATE POLICY "Users can view own rewards" ON public.rewards FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rewards" ON public.rewards FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rewards" ON public.rewards FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own rewards" ON public.rewards FOR DELETE USING (user_id = auth.uid());

-- XP transactions policies
CREATE POLICY "Users can view own xp transactions" ON public.xp_transactions FOR SELECT USING (user_id = auth.uid());

-- Friends policies
CREATE POLICY "Users can view own friend relationships" ON public.friends FOR SELECT USING (
  user_id_1 = auth.uid() OR user_id_2 = auth.uid()
);
CREATE POLICY "Users can manage own friend requests" ON public.friends FOR ALL USING (
  user_id_1 = auth.uid() OR user_id_2 = auth.uid()
);

-- User challenge progress policies
CREATE POLICY "Users can view own challenge progress" ON public.user_challenge_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own challenge progress" ON public.user_challenge_progress FOR ALL USING (user_id = auth.uid());

-- Functions to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, bio, total_xp, current_level, coins)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'bio', 0, 1, 0);

  -- Initialize user stats
  INSERT INTO public.user_stats (user_id, total_xp, current_level, longest_habit_streak, total_tasks_completed, longest_active_days)
  VALUES (NEW.id, 0, 1, 0, 0, 0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert initial achievements
INSERT INTO public.achievements (title, description, icon_url, requirement_type, requirement_value) VALUES
('First Task', 'Complete your first task', 'check-circle', 'tasks', 1),
('Task Master', 'Complete 50 tasks', 'trophy', 'tasks', 50),
('Century', 'Complete 100 tasks', 'medal', 'tasks', 100),
('Habit Builder', 'Create your first habit', 'repeat', 'habits_created', 1),
('Consistency Streak', 'Maintain a 7-day habit streak', 'fire', 'streak', 7),
('Iron Habit', 'Maintain a 30-day habit streak', 'flame', 'streak', 30),
('Level 5', 'Reach level 5', 'star', 'level', 5),
('Level 10', 'Reach level 10', 'award', 'level', 10),
('Level 25', 'Reach level 25', 'crown', 'level', 25),
('Coin Collector', 'Earn 500 coins', 'coins', 'coins', 500),
('Goal Setter', 'Create your first goal', 'target', 'goals_created', 1),
('Goal Crusher', 'Complete 5 goals', 'target', 'goals', 5),
('Weekly Warrior', 'Complete tasks for 7 consecutive days', 'calendar', 'active_days', 7),
('Night Owl', 'Complete a task between 9 PM - 6 AM', 'moon', 'night_task', 1),
('Early Bird', 'Complete a task between 5 AM - 9 AM', 'sun', 'morning_task', 1);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX idx_user_stats_total_xp ON public.user_stats(total_xp DESC);
CREATE INDEX idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX idx_friends_user_id_1 ON public.friends(user_id_1);
CREATE INDEX idx_friends_user_id_2 ON public.friends(user_id_2);