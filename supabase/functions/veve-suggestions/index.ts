import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing environment variables");
    }

    // Get user from auth header
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ suggestions: [
        "💰 Como economizar dinheiro?",
        "📊 Me dê dicas de investimento",
        "🏦 Como montar uma reserva de emergência?",
        "📋 Explique o método 50/30/20",
      ]}), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch recent transactions
    const { data: transactions } = await supabase
      .from("transactions")
      .select("category, amount, type, transaction_date")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .limit(50);

    if (!transactions || transactions.length === 0) {
      return new Response(JSON.stringify({ suggestions: [
        "💰 Como começar a organizar minhas finanças?",
        "📊 Me dê dicas de investimento para iniciantes",
        "🏦 Como montar uma reserva de emergência?",
        "📋 Qual o melhor método de orçamento pra mim?",
      ]}), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build context summary
    const totalExpenses = transactions.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + Number(t.amount), 0);
    const totalIncome = transactions.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + Number(t.amount), 0);
    const categoryCounts: Record<string, number> = {};
    transactions.filter((t: any) => t.type === "expense").forEach((t: any) => {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + Number(t.amount);
    });
    const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

    const summary = `Resumo financeiro recente do usuário:
- Total de despesas: R$ ${totalExpenses.toFixed(2)}
- Total de receitas: R$ ${totalIncome.toFixed(2)}
- Saldo: R$ ${(totalIncome - totalExpenses).toFixed(2)}
- Top categorias de gasto: ${topCategories.map(([cat, val]) => `${cat} (R$ ${val.toFixed(2)})`).join(", ")}
- Número de transações: ${transactions.length}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `Baseado no resumo financeiro abaixo, gere exatamente 4 perguntas curtas e relevantes que o usuário poderia fazer para uma assistente financeira. Cada pergunta deve começar com um emoji relevante. Retorne APENAS as 4 perguntas, uma por linha, sem numeração.

${summary}` },
          { role: "user", content: "Gere as perguntas sugeridas." }
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_suggestions",
            description: "Return suggested questions",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of 4 suggested questions"
                }
              },
              required: ["suggestions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "return_suggestions" } }
      }),
    });

    if (!response.ok) {
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let suggestions: string[];

    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      suggestions = args.suggestions.slice(0, 4);
    } else {
      // Fallback: parse from text
      const text = aiData.choices?.[0]?.message?.content || "";
      suggestions = text.split("\n").filter((l: string) => l.trim()).slice(0, 4);
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggestions error:", e);
    return new Response(JSON.stringify({ suggestions: [
      "💰 Como economizar dinheiro?",
      "📊 Me dê dicas de investimento",
      "🏦 Como montar uma reserva de emergência?",
      "📋 Explique o método 50/30/20",
    ]}), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
