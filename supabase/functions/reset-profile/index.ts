import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const errors: string[] = [];

    // Helper to delete from a table by user_id
    const deleteByUserId = async (table: string, column = "user_id") => {
      const { error } = await adminClient.from(table).delete().eq(column, userId);
      if (error) {
        console.error(`Error deleting from ${table}:`, error.message);
        errors.push(`${table}: ${error.message}`);
      }
    };

    // 1. Hair care - handle schedule_items first (no user_id column)
    const { data: schedules } = await adminClient
      .from("hair_schedules")
      .select("id")
      .eq("user_id", userId);

    if (schedules && schedules.length > 0) {
      const scheduleIds = schedules.map((s: { id: string }) => s.id);
      // Delete treatment logs for these schedules' items
      const { data: items } = await adminClient
        .from("hair_schedule_items")
        .select("id")
        .in("schedule_id", scheduleIds);
      if (items && items.length > 0) {
        const itemIds = items.map((i: { id: string }) => i.id);
        await adminClient.from("hair_treatment_logs").delete().in("schedule_item_id", itemIds);
      }
      // Delete schedule items
      await adminClient.from("hair_schedule_items").delete().in("schedule_id", scheduleIds);
    }

    // 2. Delete tables with standard user_id column
    const userIdTables = [
      "habit_completions",
      "habits",
      "routine_completions",
      "routine_tasks",
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
      "hair_treatment_logs",
      "hair_schedules",
      "hair_profiles",
      "post_likes",
      "comments",
      "posts",
      "connections",
      "introduction_likes",
      "introduction_comments",
      "introductions",
      "challenge_checkins",
      "challenge_participants",
      "selfcare_checkins",
      "selfcare_pillar_actions",
      "achievement_shares",
      "user_achievements",
      "point_history",
      "events",
      "wishlist",
    ];

    for (const table of userIdTables) {
      await deleteByUserId(table);
    }

    // 3. Follows uses follower_id / following_id, not user_id
    const { error: f1 } = await adminClient.from("follows").delete().eq("follower_id", userId);
    if (f1) errors.push(`follows(follower): ${f1.message}`);
    const { error: f2 } = await adminClient.from("follows").delete().eq("following_id", userId);
    if (f2) errors.push(`follows(following): ${f2.message}`);

    // 4. Reset user_stats to zero
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

    // 5. Reset profile (keep user_id & created_at)
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

    // Don't delete: subscriptions, user_roles

    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile reset successfully",
        warnings: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Reset profile error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
