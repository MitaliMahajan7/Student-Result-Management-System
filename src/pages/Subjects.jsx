import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [max, setMax] = useState("100");
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from("subjects").select("*").order("name");
    setSubjects(data ?? []);
    setLoading(false);
  }
  useEffect(() => {load();}, []);

  async function add(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("subjects").insert({ name, code, max_marks: Number(max) });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Subject added");
    setName("");setCode("");setMax("100");
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this subject? Related results will also be removed.")) return;
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subjects</h1>
        <p className="text-muted-foreground">Manage academic subjects</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Add subject</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={add} className="space-y-3">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Max Marks</Label><Input type="number" value={max} onChange={(e) => setMax(e.target.value)} required /></div>
              <Button disabled={saving}><Plus className="h-4 w-4" /> Add</Button>
            </form>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{subjects.length} subjects</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Loader2 className="animate-spin text-primary" /> :
            <Table>
                <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Max</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {subjects.map((s) =>
                <TableRow key={s.id}>
                      <TableCell className="font-mono">{s.code}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.max_marks}</TableCell>
                      <TableCell><Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                )}
                </TableBody>
              </Table>
            }
          </CardContent>
        </Card>
      </div>
    </div>);

}