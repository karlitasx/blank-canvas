import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client to get user id
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Service role client to delete data
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Tables to clear (order matters for foreign keys)
    // Delete child tables first, then parent tables
    const deletionOrder = [
      // Habit related
      "habit_completions",
      "habits",
      // Routine related
      "routine_completions",
      "routine_tasks",
      // Finance related
      "transactions",
      "finance_goals",
      "finance_cards",
      "finance_categories",
      "payment_methods",
      "business_expenses",
      "business_sales",
      "business_settings",
      "das_payments",
      "fiscal_reminders",
      // Hair care related
      "hair_treatment_logs",
      "hair_schedule_items",  // needs schedule_id, handled via cascade or manual
      "hair_schedules",
      "hair_profiles",
      // Social related
      "post_likes",
      "comments",
      "posts",
      "follows",
      "connections",
      "introduction_likes",
      "introduction_comments",
      "introductions",
      // Challenge related
      "challenge_checkins",
      "challenge_participants",
      // We don't delete challenges created by user to not break other participants
      // Selfcare
      "selfcare_checkins",
      "selfcare_pillar_actions",
      // Achievements
      "achievement_shares",
      "user_achievements",
      // Points & stats
      "point_history",
      // Events
      "events",
      // Wishlist
      "wishlist",
    ];

    const errors: string[] = [];

    for (const table of deletionOrder) {
      const { error } = await adminClient
        .from(table)
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error(`Error deleting from ${table}:`, error.message);
        errors.push(`${table}: ${error.message}`);
      }
    }

    // Delete hair_schedule_items via schedule ids (no direct user_id column)
    const { data: schedules } = await adminClient
      .from("hair_schedules")
      .select("id")
      .eq("user_id", userId);
    
    if (schedules && schedules.length > 0) {
      const scheduleIds = schedules.map((s: { id: string }) => s.id);
      await adminClient
        .from("hair_schedule_items")
        .delete()
        .in("schedule_id", scheduleIds);
    }

    // Reset user_stats to zero (don't delete, just reset)
    await adminClient
      .from("user_stats")
      .update({
        total_points: 0,
        habits_completed: 0,
        current_streak: 0,
        longest_streak: 0,
        transactions_logged: 0,
        level: "Semente",
        last_activity_date: null,
      })
      .eq("user_id", userId);

    // Reset profile (keep user_id, reset display name and avatar)
    await adminClient
      .from("profiles")
      .update({
        bio: null,
        avatar_url: null,
        interests: [],
        show_achievements: true,
        followers_count: 0,
        following_count: 0,
      })
      .eq("user_id", userId);

    // Don't delete: subscriptions, user_roles (keep access & plan)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Profile reset successfully",
        warnings: errors.length > 0 ? errors : undefined 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Reset profile error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

