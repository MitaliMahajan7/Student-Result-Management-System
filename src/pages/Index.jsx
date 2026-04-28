import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, BarChart3, Sparkles, Shield, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <GraduationCap className="h-6 w-6" /> SRMS
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild><Link to="/auth">Sign in</Link></Button>
            <Button asChild><Link to="/auth">Get started</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center text-primary-foreground">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Student Result Management System
          </h1>
          <p className="mt-6 text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            A modern, secure platform for schools and universities to manage students, record exam results,
            and generate insights — powered by AI guidance.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" asChild className="bg-card text-primary hover:bg-card/90">
              <Link to="/auth">Get started — it's free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
          { icon: Users, title: "Role-based access", desc: "Separate dashboards for admins, teachers, and students with secure RLS policies." },
          { icon: BookOpen, title: "Subjects & marksheets", desc: "Manage subjects, exam terms, and per-student results in one place." },
          { icon: BarChart3, title: "Performance insights", desc: "Auto-calculated grades and percentages help track academic progress." },
          { icon: Sparkles, title: "AI assistant", desc: "Built-in AI guide explains the app and analyzes student performance." },
          { icon: Shield, title: "Secure by design", desc: "Row-level security ensures students only see their own data." },
          { icon: GraduationCap, title: "Modern academic UX", desc: "Designed to feel professional, fast, and trustworthy on any device." }].
          map((f) =>
          <div key={f.title} className="rounded-xl border bg-card p-6 shadow-card hover:shadow-elegant transition-shadow">
              <div className="h-10 w-10 rounded-lg grid place-items-center bg-primary/10 text-primary mb-4">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-muted-foreground text-sm mt-2">{f.desc}</p>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SRMS — Built for modern academia.
      </footer>
    </div>);

}