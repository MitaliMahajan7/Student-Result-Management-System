import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Users, FileText, BookOpen, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({ students: 0, results: 0, subjects: 0, avg: 0 });
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      if (profile) setName(profile.full_name);

      // student count = profiles that have student role
      const [{ count: studentCount }, { count: subjectCount }] = await Promise.all([
      supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("subjects").select("*", { count: "exact", head: true })]
      );

      let resultsQuery = supabase.from("results").select("marks_obtained", { count: "exact" });
      if (role === "student") resultsQuery = resultsQuery.eq("student_id", user.id);
      const { data: results, count: resultsCount } = await resultsQuery;
      const avg =
      results && results.length ?
      results.reduce((s, r) => s + Number(r.marks_obtained), 0) / results.length :
      0;

      setStats({
        students: studentCount ?? 0,
        results: resultsCount ?? 0,
        subjects: subjectCount ?? 0,
        avg: Math.round(avg * 10) / 10
      });
    })();
  }, [user, role]);

  const cards = [
  { label: role === "student" ? "Your Results" : "Total Results", value: stats.results, icon: FileText },
  { label: "Subjects", value: stats.subjects, icon: BookOpen },
  ...(role !== "student" ? [{ label: "Students", value: stats.students, icon: Users }] : []),
  { label: role === "student" ? "Your Average" : "Avg Marks", value: stats.avg, icon: TrendingUp, suffix: "" }];


  return (
    <div className="space-y-8">
      <div
        className="rounded-xl p-8 text-primary-foreground shadow-elegant"
        style={{ background: "var(--gradient-primary)" }}>
        
        <h1 className="text-3xl font-bold">Welcome back, {name || "User"} 👋</h1>
        <p className="opacity-90 mt-1 capitalize">Signed in as {role}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) =>
        <Card key={c.label} className="shadow-card">
            <CardHeader className="flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Use the sidebar to navigate between sections.</p>
          <p>• Click the floating AI button (bottom-right) for guidance and result insights.</p>
          {role === "admin" && <p>• Add new subjects from the Subjects page.</p>}
          {(role === "admin" || role === "teacher") && <p>• Add results from the Add Result page.</p>}
          {role === "student" && <p>• View your full marksheet from the Results page.</p>}
        </CardContent>
      </Card>
    </div>);

}