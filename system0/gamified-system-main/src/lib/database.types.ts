export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          bio: string | null
          total_xp: number
          current_level: number
          coins: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          total_xp?: number
          current_level?: number
          coins?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          total_xp?: number
          current_level?: number
          coins?: number
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          priority: 'High' | 'Medium' | 'Low'
          status: 'Todo' | 'In Progress' | 'Done'
          due_date: string | null
          tags: string[] | null
          area: string | null
          estimated_xp: number
          is_recurring: boolean
          recurrence: 'daily' | 'weekly' | 'monthly' | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          priority?: 'High' | 'Medium' | 'Low'
          status?: 'Todo' | 'In Progress' | 'Done'
          due_date?: string | null
          tags?: string[] | null
          area?: string | null
          estimated_xp?: number
          is_recurring?: boolean
          recurrence?: 'daily' | 'weekly' | 'monthly' | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          priority?: 'High' | 'Medium' | 'Low'
          status?: 'Todo' | 'In Progress' | 'Done'
          due_date?: string | null
          tags?: string[] | null
          area?: string | null
          estimated_xp?: number
          is_recurring?: boolean
          recurrence?: 'daily' | 'weekly' | 'monthly' | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          frequency: 'daily' | 'weekly' | 'monthly'
          xp_reward: number
          current_streak: number
          longest_streak: number
          last_completed_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          frequency?: 'daily' | 'weekly' | 'monthly'
          xp_reward?: number
          current_streak?: number
          longest_streak?: number
          last_completed_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          frequency?: 'daily' | 'weekly' | 'monthly'
          xp_reward?: number
          current_streak?: number
          longest_streak?: number
          last_completed_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      habit_logs: {
        Row: {
          id: string
          habit_id: string
          completed_date: string
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          completed_date: string
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          completed_date?: string
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'Not Started' | 'In Progress' | 'Completed' | 'Abandoned'
          progress_percent: number
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'Not Started' | 'In Progress' | 'Completed' | 'Abandoned'
          progress_percent?: number
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'Not Started' | 'In Progress' | 'Completed' | 'Abandoned'
          progress_percent?: number
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      goal_tasks: {
        Row: {
          goal_id: string
          task_id: string
        }
        Insert: {
          goal_id: string
          task_id: string
        }
        Update: {
          goal_id?: string
          task_id?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          total_xp: number
          current_level: number
          longest_habit_streak: number
          total_tasks_completed: number
          longest_active_days: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_xp?: number
          current_level?: number
          longest_habit_streak?: number
          total_tasks_completed?: number
          longest_active_days?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_xp?: number
          current_level?: number
          longest_habit_streak?: number
          total_tasks_completed?: number
          longest_active_days?: number
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          title: string
          description: string | null
          icon_url: string | null
          requirement_type: 'tasks' | 'level' | 'streak' | 'xp' | 'goals' | 'habits_created' | 'goals_created' | 'active_days' | 'night_task' | 'morning_task' | 'areas' | 'high_priority_tasks' | 'concurrent_habits' | 'habit_streak' | 'total_xp' | 'daily_challenges' | 'early_signup' | 'friends' | 'rewards_redeemed'
          requirement_value: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          icon_url?: string | null
          requirement_type: 'tasks' | 'level' | 'streak' | 'xp' | 'goals' | 'habits_created' | 'goals_created' | 'active_days' | 'night_task' | 'morning_task' | 'areas' | 'high_priority_tasks' | 'concurrent_habits' | 'habit_streak' | 'total_xp' | 'daily_challenges' | 'early_signup' | 'friends' | 'rewards_redeemed'
          requirement_value: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          icon_url?: string | null
          requirement_type?: 'tasks' | 'level' | 'streak' | 'xp' | 'goals' | 'habits_created' | 'goals_created' | 'active_days' | 'night_task' | 'morning_task' | 'areas' | 'high_priority_tasks' | 'concurrent_habits' | 'habit_streak' | 'total_xp' | 'daily_challenges' | 'early_signup' | 'friends' | 'rewards_redeemed'
          requirement_value?: number
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
      rewards: {
        Row: {
          id: string
          user_id: string
          title: string
          cost_coins: number
          description: string | null
          is_redeemed: boolean
          redeemed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          cost_coins: number
          description?: string | null
          is_redeemed?: boolean
          redeemed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          cost_coins?: number
          description?: string | null
          is_redeemed?: boolean
          redeemed_at?: string | null
          created_at?: string
        }
      }
      xp_transactions: {
        Row: {
          id: string
          user_id: string
          xp_amount: number
          reason: 'task_complete' | 'habit_complete' | 'achievement' | 'daily_bonus' | 'challenge' | 'goal_complete'
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          xp_amount: number
          reason: 'task_complete' | 'habit_complete' | 'achievement' | 'daily_bonus' | 'challenge' | 'goal_complete'
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          xp_amount?: number
          reason?: 'task_complete' | 'habit_complete' | 'achievement' | 'daily_bonus' | 'challenge' | 'goal_complete'
          reference_id?: string | null
          created_at?: string
        }
      }
      friends: {
        Row: {
          id: string
          user_id_1: string
          user_id_2: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
        }
        Insert: {
          id?: string
          user_id_1: string
          user_id_2: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
        }
        Update: {
          id?: string
          user_id_1?: string
          user_id_2?: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
        }
      }
      daily_challenges: {
        Row: {
          id: string
          challenge_date: string
          task_target: number
          habit_target: number
          xp_target: number
          coin_reward: number
          xp_reward: number
          created_at: string
        }
        Insert: {
          id?: string
          challenge_date: string
          task_target: number
          habit_target: number
          xp_target: number
          coin_reward: number
          xp_reward: number
          created_at?: string
        }
        Update: {
          id?: string
          challenge_date?: string
          task_target?: number
          habit_target?: number
          xp_target?: number
          coin_reward?: number
          xp_reward?: number
          created_at?: string
        }
      }
      user_challenge_progress: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          tasks_completed: number
          habits_completed: number
          xp_earned: number
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          tasks_completed?: number
          habits_completed?: number
          xp_earned?: number
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          tasks_completed?: number
          habits_completed?: number
          xp_earned?: number
          completed?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}