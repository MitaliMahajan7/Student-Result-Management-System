import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { GraduationCap, Loader2 } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  // signin
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roll, setRoll] = useState("");
  const [role, setRole] = useState("student");

  useEffect(() => {
    if (!authLoading && user) navigate("/dashboard", { replace: true });
  }, [user, authLoading, navigate]);

  async function handleSignIn(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate("/dashboard", { replace: true });
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: name, role, roll_number: role === "student" ? roll : null }
      }
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. You're signed in!");
    navigate("/dashboard", { replace: true });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--gradient-hero)" }}>
      
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6 text-primary-foreground">
          <GraduationCap className="h-8 w-8" />
          <span className="text-2xl font-bold">SRMS</span>
        </Link>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>Access the Student Result Management System</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="si-email">Email</Label>
                    <Input id="si-email" type="email" required value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="si-password">Password</Label>
                    <Input id="si-password" type="password" required value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} />
                  </div>
                  <Button className="w-full" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="su-name">Full name</Label>
                    <Input id="su-name" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-password">Password</Label>
                    <Input id="su-password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={role} onValueChange={(v) => setRole(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {role === "student" &&
                  <div className="space-y-2">
                      <Label htmlFor="su-roll">Roll Number</Label>
                      <Input id="su-roll" required value={roll} onChange={(e) => setRoll(e.target.value)} />
                    </div>
                  }
                  <Button className="w-full" disabled={loading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>);

}