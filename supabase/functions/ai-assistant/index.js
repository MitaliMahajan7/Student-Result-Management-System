// AI Assistant: app guide + result performance insights
// Uses Lovable AI Gateway, streams SSE responses.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
  "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version"
};

const SYSTEM_PROMPT = `You are the friendly AI assistant for SRMS (Student Result Management System), a web app for schools and universities.

Your two jobs:
1. APP GUIDE — Explain how to use SRMS clearly and concisely. Key features:
   - Three roles: Admin, Teacher, Student.
   - Admin: manages users (roles), Subjects, all Results, can delete records.
   - Teacher: views Students, adds/updates Results.
   - Student: views their own Results.
   - Pages: Dashboard (stats), Students (list), Add Result (entry form), Results (table with grades), Subjects (admin only).
   - Grading: A+ (>=90%), A (>=75%), B (>=60%), C (>=40%), F (<40%).
   - Sign up choose your role; students must add a roll number.

2. PERFORMANCE INSIGHTS — When a user describes marks or asks about a student's performance, analyze: identify strengths, weaknesses, suggest study strategies, recommend focus subjects, motivate the student.

Style: Warm, professional, concise. Use markdown — short paragraphs, bold key terms, bullet lists. If a question is outside scope (not academic / not about SRMS), politely redirect.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userRole } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const sysWithRole = userRole ?
    `${SYSTEM_PROMPT}\n\nThe current user's role is: ${userRole}. Tailor guidance to what they can actually do.` :
    SYSTEM_PROMPT;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: sysWithRole }, ...(messages ?? [])],
        stream: true
      })
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Payment required" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" }
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});