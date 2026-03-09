export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      achievement_shares: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          message: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          message?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          message?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_achievements: {
        Row: {
          achievement_key: string
          created_at: string
          description: string
          emoji: string
          expires_at: string | null
          id: string
          is_active: boolean
          is_permanent: boolean
          name: string
          unlock_condition: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          achievement_key: string
          created_at?: string
          description: string
          emoji?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_permanent?: boolean
          name: string
          unlock_condition: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          achievement_key?: string
          created_at?: string
          description?: string
          emoji?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_permanent?: boolean
          name?: string
          unlock_condition?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      business_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          expense_date: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      business_sales: {
        Row: {
          amount: number
          client_name: string | null
          created_at: string
          id: string
          notes: string | null
          payment_method: string
          sale_date: string
          user_id: string
        }
        Insert: {
          amount: number
          client_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string
          sale_date?: string
          user_id: string
        }
        Update: {
          amount?: number
          client_name?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string
          sale_date?: string
          user_id?: string
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          business_type: string
          cnpj: string | null
          company_name: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_type?: string
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_type?: string
          cnpj?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_checkins: {
        Row: {
          caption: string | null
          challenge_id: string
          checkin_date: string
          created_at: string
          id: string
          photo_url: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          challenge_id: string
          checkin_date?: string
          created_at?: string
          id?: string
          photo_url: string
          user_id: string
        }
        Update: {
          caption?: string | null
          challenge_id?: string
          checkin_date?: string
          created_at?: string
          id?: string
          photo_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_checkins_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          completed_at: string | null
          current_progress: number
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          current_progress?: number
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          current_progress?: number
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string
          created_at: string
          created_by: string
          description: string | null
          difficulty: string
          emoji: string
          end_date: string
          id: string
          is_public: boolean
          points_per_checkin: number
          start_date: string
          target_value: number
          title: string
          updated_at: string
        }
        Insert: {
          challenge_type?: string
          created_at?: string
          created_by: string
          description?: string | null
          difficulty?: string
          emoji?: string
          end_date: string
          id?: string
          is_public?: boolean
          points_per_checkin?: number
          start_date: string
          target_value: number
          title: string
          updated_at?: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty?: string
          emoji?: string
          end_date?: string
          id?: string
          is_public?: boolean
          points_per_checkin?: number
          start_date?: string
          target_value?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          action: string
          connection_type: string
          created_at: string
          id: string
          target_user_id: string
          user_id: string
        }
        Insert: {
          action: string
          connection_type?: string
          created_at?: string
          id?: string
          target_user_id: string
          user_id: string
        }
        Update: {
          action?: string
          connection_type?: string
          created_at?: string
          id?: string
          target_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      das_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          paid_at: string | null
          reference_month: string
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          reference_month: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          reference_month?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string
          color: string
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          event_time: string | null
          id: string
          is_completed: boolean
          is_public: boolean
          is_recurring: boolean
          recurring_pattern: string | null
          reminder_minutes: number | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string
          color?: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          is_completed?: boolean
          is_public?: boolean
          is_recurring?: boolean
          recurring_pattern?: string | null
          reminder_minutes?: number | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          is_completed?: boolean
          is_public?: boolean
          is_recurring?: boolean
          recurring_pattern?: string | null
          reminder_minutes?: number | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      finance_cards: {
        Row: {
          brand: string
          card_color: string
          card_type: string
          closing_day: number | null
          created_at: string
          credit_limit: number | null
          due_day: number | null
          id: string
          is_active: boolean
          last_digits: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string
          card_color?: string
          card_type?: string
          closing_day?: number | null
          created_at?: string
          credit_limit?: number | null
          due_day?: number | null
          id?: string
          is_active?: boolean
          last_digits?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string
          card_color?: string
          card_type?: string
          closing_day?: number | null
          created_at?: string
          credit_limit?: number | null
          due_day?: number | null
          id?: string
          is_active?: boolean
          last_digits?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_categories: {
        Row: {
          color: string
          created_at: string
          finance_type: string
          icon_name: string
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          finance_type?: string
          icon_name?: string
          id?: string
          name: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          finance_type?: string
          icon_name?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_goals: {
        Row: {
          created_at: string
          current_amount: number
          description: string | null
          emoji: string
          id: string
          image_url: string | null
          priority: string
          status: string
          target_amount: number
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          description?: string | null
          emoji?: string
          id?: string
          image_url?: string | null
          priority?: string
          status?: string
          target_amount?: number
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          description?: string | null
          emoji?: string
          id?: string
          image_url?: string | null
          priority?: string
          status?: string
          target_amount?: number
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fiscal_reminders: {
        Row: {
          created_at: string
          description: string | null
          due_date: string
          id: string
          is_completed: boolean
          reminder_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          is_completed?: boolean
          reminder_type?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          is_completed?: boolean
          reminder_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed_at: string
          completed_date: string
          difficulty: number | null
          habit_id: string
          id: string
          mood: string | null
          note: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          completed_date?: string
          difficulty?: number | null
          habit_id: string
          id?: string
          mood?: string | null
          note?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string
          completed_date?: string
          difficulty?: number | null
          habit_id?: string
          id?: string
          mood?: string | null
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          best_streak: number
          category: string
          category_color: string
          created_at: string
          emoji: string
          frequency_days: string[] | null
          frequency_interval_days: number | null
          frequency_times_per_week: number | null
          frequency_type: string
          goal_days: number | null
          id: string
          is_active: boolean
          motivation: string | null
          name: string
          reminder_time: string | null
          streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          best_streak?: number
          category?: string
          category_color?: string
          created_at?: string
          emoji?: string
          frequency_days?: string[] | null
          frequency_interval_days?: number | null
          frequency_times_per_week?: number | null
          frequency_type?: string
          goal_days?: number | null
          id?: string
          is_active?: boolean
          motivation?: string | null
          name: string
          reminder_time?: string | null
          streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          best_streak?: number
          category?: string
          category_color?: string
          created_at?: string
          emoji?: string
          frequency_days?: string[] | null
          frequency_interval_days?: number | null
          frequency_times_per_week?: number | null
          frequency_type?: string
          goal_days?: number | null
          id?: string
          is_active?: boolean
          motivation?: string | null
          name?: string
          reminder_time?: string | null
          streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      introductions: {
        Row: {
          content: string
          created_at: string
          goals: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          goals?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          goals?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          color: string
          created_at: string
          icon_name: string
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          name: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      point_history: {
        Row: {
          action_id: string | null
          action_type: string
          created_at: string
          id: string
          points: number
          user_id: string
        }
        Insert: {
          action_id?: string | null
          action_type: string
          created_at?: string
          id?: string
          points: number
          user_id: string
        }
        Update: {
          action_id?: string | null
          action_type?: string
          created_at?: string
          id?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number
          content: string
          created_at: string
          emoji: string | null
          id: string
          is_hidden: boolean
          likes_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          content: string
          created_at?: string
          emoji?: string | null
          id?: string
          is_hidden?: boolean
          likes_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          content?: string
          created_at?: string
          emoji?: string | null
          id?: string
          is_hidden?: boolean
          likes_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          currency: string | null
          display_name: string | null
          followers_count: number
          following_count: number
          id: string
          interests: string[] | null
          is_suspended: boolean
          language: string | null
          show_achievements: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          currency?: string | null
          display_name?: string | null
          followers_count?: number
          following_count?: number
          id?: string
          interests?: string[] | null
          is_suspended?: boolean
          language?: string | null
          show_achievements?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          currency?: string | null
          display_name?: string | null
          followers_count?: number
          following_count?: number
          id?: string
          interests?: string[] | null
          is_suspended?: boolean
          language?: string | null
          show_achievements?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      routine_completions: {
        Row: {
          completed_at: string
          completed_date: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          completed_date?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          completed_date?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "routine_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_tasks: {
        Row: {
          category: string
          created_at: string
          difficulty: string
          emoji: string
          end_time: string | null
          frequency_days: string[] | null
          frequency_type: string
          id: string
          is_active: boolean
          is_recurring: boolean
          points_value: number
          sort_order: number
          start_time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          difficulty?: string
          emoji?: string
          end_time?: string | null
          frequency_days?: string[] | null
          frequency_type?: string
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          points_value?: number
          sort_order?: number
          start_time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          difficulty?: string
          emoji?: string
          end_time?: string | null
          frequency_days?: string[] | null
          frequency_type?: string
          id?: string
          is_active?: boolean
          is_recurring?: boolean
          points_value?: number
          sort_order?: number
          start_time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      selfcare_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          emotional_state: string
          energy_level: number | null
          gratitudes: string[] | null
          id: string
          note: string | null
          ritual_completed: boolean | null
          ritual_type: string | null
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          emotional_state: string
          energy_level?: number | null
          gratitudes?: string[] | null
          id?: string
          note?: string | null
          ritual_completed?: boolean | null
          ritual_type?: string | null
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          emotional_state?: string
          energy_level?: number | null
          gratitudes?: string[] | null
          id?: string
          note?: string | null
          ritual_completed?: boolean | null
          ritual_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      selfcare_pillar_actions: {
        Row: {
          action_date: string
          action_text: string
          created_at: string
          id: string
          pillar: string
          user_id: string
        }
        Insert: {
          action_date?: string
          action_text: string
          created_at?: string
          id?: string
          pillar: string
          user_id: string
        }
        Update: {
          action_date?: string
          action_text?: string
          created_at?: string
          id?: string
          pillar?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          cnpj: string | null
          cost_center: string | null
          created_at: string
          description: string | null
          finance_type: string
          id: string
          invoice_number: string | null
          transaction_date: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          cnpj?: string | null
          cost_center?: string | null
          created_at?: string
          description?: string | null
          finance_type?: string
          id?: string
          invoice_number?: string | null
          transaction_date?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          cnpj?: string | null
          cost_center?: string | null
          created_at?: string
          description?: string | null
          finance_type?: string
          id?: string
          invoice_number?: string | null
          transaction_date?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string
          current_streak: number
          habits_completed: number
          id: string
          last_activity_date: string | null
          level: string
          longest_streak: number
          total_points: number
          transactions_logged: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          habits_completed?: number
          id?: string
          last_activity_date?: string | null
          level?: string
          longest_streak?: number
          total_points?: number
          transactions_logged?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          habits_completed?: number
          id?: string
          last_activity_date?: string | null
          level?: string
          longest_streak?: number
          total_points?: number
          transactions_logged?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          completed_at: string | null
          created_at: string
          current_amount: number
          emoji: string
          id: string
          is_completed: boolean
          name: string
          priority: string
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_amount?: number
          emoji?: string
          id?: string
          is_completed?: boolean
          name: string
          priority?: string
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_amount?: number
          emoji?: string
          id?: string
          is_completed?: boolean
          name?: string
          priority?: string
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_points_to_user: {
        Args: {
          p_action_id: string
          p_action_type: string
          p_points: number
          target_user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
