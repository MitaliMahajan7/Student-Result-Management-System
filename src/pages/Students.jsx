import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";








export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      // Get all user_ids with student role, then their profiles
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
      const ids = (roles ?? []).map((r) => r.user_id);
      if (!ids.length) {
        setStudents([]);
        setLoading(false);
        return;
      }
      const { data: profiles } = await supabase.from("profiles").select("*").in("id", ids);
      setStudents(profiles ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = students.filter(
    (s) =>
    s.full_name.toLowerCase().includes(q.toLowerCase()) ||
    s.email.toLowerCase().includes(q.toLowerCase()) ||
    (s.roll_number ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground">All registered students</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <span>{filtered.length} students</span>
            <div className="relative max-w-sm w-full">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ?
          <div className="grid place-items-center py-10">
              <Loader2 className="animate-spin text-primary" />
            </div> :

          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) =>
              <TableRow key={s.id}>
                    <TableCell className="font-mono">{s.roll_number ?? "—"}</TableCell>
                    <TableCell className="font-medium">{s.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.email}</TableCell>
                  </TableRow>
              )}
                {!filtered.length &&
              <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No students found.
                    </TableCell>
                  </TableRow>
              }
              </TableBody>
            </Table>
          }
        </CardContent>
      </Card>
    </div>);

}