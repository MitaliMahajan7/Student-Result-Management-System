import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AddResult() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [marks, setMarks] = useState("");
  const [term, setTerm] = useState("Final");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "student");
      const ids = (roles ?? []).map((r) => r.user_id);
      const [{ data: profs }, { data: subs }] = await Promise.all([
      ids.length ?
      supabase.from("profiles").select("id, full_name, roll_number").in("id", ids) :
      Promise.resolve({ data: [] }),
      supabase.from("subjects").select("id, name, max_marks").order("name")]
      );
      setStudents(profs ?? []);
      setSubjects(subs ?? []);
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("results").upsert(
      {
        student_id: studentId,
        subject_id: subjectId,
        marks_obtained: Number(marks),
        exam_term: term,
        exam_year: Number(year),
        created_by: user?.id
      },
      { onConflict: "student_id,subject_id,exam_term,exam_year" }
    );
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Result saved");
    setMarks("");
  }

  const selectedSubject = subjects.find((s) => s.id === subjectId);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Add / Update Result</h1>
        <p className="text-muted-foreground">Record student marks for a subject</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Result entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={studentId} onValueChange={setStudentId} required>
                <SelectTrigger><SelectValue placeholder="Select a student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s) =>
                  <SelectItem key={s.id} value={s.id}>
                      {s.full_name} {s.roll_number ? `(${s.roll_number})` : ""}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={subjectId} onValueChange={setSubjectId} required>
                <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) =>
                  <SelectItem key={s.id} value={s.id}>{s.name} (max {s.max_marks})</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Marks</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max={selectedSubject?.max_marks ?? 100}
                  required
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)} />
                
              </div>
              <div className="space-y-2">
                <Label>Term</Label>
                <Select value={term} onValueChange={setTerm}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mid-term">Mid-term</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input type="number" required value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={saving || !studentId || !subjectId}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Result
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>);

}