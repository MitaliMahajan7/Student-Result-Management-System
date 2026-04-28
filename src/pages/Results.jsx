import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";











export default function Results() {
  const { role, user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    let query = supabase.
    from("results").
    select("id, marks_obtained, exam_term, exam_year, student_id, student:profiles!results_student_id_fkey(full_name, roll_number), subject:subjects(name, max_marks)").
    order("created_at", { ascending: false });
    if (role === "student" && user) query = query.eq("student_id", user.id);
    const { data, error } = await query;
    if (error) toast.error(error.message);
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (role) load();
  }, [role, user]);

  async function handleDelete(id) {
    if (!confirm("Delete this result?")) return;
    const { error } = await supabase.from("results").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  const filtered = rows.filter((r) => {
    const s = q.toLowerCase();
    return (
      !s ||
      r.student?.full_name.toLowerCase().includes(s) ||
      r.subject?.name.toLowerCase().includes(s) ||
      r.student?.roll_number?.toLowerCase().includes(s));

  });

  function gradeBadge(pct) {
    if (pct >= 90) return <Badge className="bg-success text-white hover:bg-success">A+</Badge>;
    if (pct >= 75) return <Badge className="bg-primary">A</Badge>;
    if (pct >= 60) return <Badge variant="secondary">B</Badge>;
    if (pct >= 40) return <Badge variant="outline">C</Badge>;
    return <Badge variant="destructive">F</Badge>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Results</h1>
        <p className="text-muted-foreground">
          {role === "student" ? "Your academic results" : "All student results"}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <span>{filtered.length} entries</span>
            {role !== "student" &&
            <div className="relative max-w-sm w-full">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by student or subject..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
              </div>
            }
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
                  {role !== "student" && <TableHead>Student</TableHead>}
                  <TableHead>Subject</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Year</TableHead>
                  {role === "admin" && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                const max = r.subject?.max_marks ?? 100;
                const pct = Number(r.marks_obtained) / max * 100;
                return (
                  <TableRow key={r.id}>
                      {role !== "student" &&
                    <TableCell className="font-medium">
                          {r.student?.full_name}{" "}
                          <span className="text-muted-foreground">({r.student?.roll_number ?? "—"})</span>
                        </TableCell>
                    }
                      <TableCell>{r.subject?.name}</TableCell>
                      <TableCell>
                        {r.marks_obtained} / {max}
                      </TableCell>
                      <TableCell>{pct.toFixed(1)}%</TableCell>
                      <TableCell>{gradeBadge(pct)}</TableCell>
                      <TableCell>{r.exam_term}</TableCell>
                      <TableCell>{r.exam_year}</TableCell>
                      {role === "admin" &&
                    <TableCell>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                    }
                    </TableRow>);

              })}
                {!filtered.length &&
              <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No results yet.
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