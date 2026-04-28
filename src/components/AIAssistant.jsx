import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Bot, Send, X, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";



const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

export function AIAssistant() {
  const { role } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
  {
    role: "assistant",
    content:
    "👋 Hi! I'm your SRMS assistant. Ask me how to use the app or for insights about student results."
  }]
  );
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({ messages: [...messages, userMsg], userRole: role })
      });

      if (resp.status === 429) {toast.error("Rate limit reached, try again shortly.");setLoading(false);return;}
      if (resp.status === 402) {toast.error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");setLoading(false);return;}
      if (!resp.ok || !resp.body) {toast.error("AI assistant failed");setLoading(false);return;}

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {done = true;break;}
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages((m) => m.map((mm, i) => i === m.length - 1 ? { ...mm, content: assistantText } : mm));
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      toast.error("Failed to reach AI assistant");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open &&
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 z-40 rounded-full h-14 w-14 shadow-elegant"
        style={{ background: "var(--gradient-primary)" }}>
        
          <Sparkles className="h-6 w-6" />
        </Button>
      }

      {open &&
      <Card className="fixed bottom-6 right-6 z-40 w-[min(380px,calc(100vw-2rem))] h-[560px] max-h-[calc(100vh-3rem)] flex flex-col shadow-elegant overflow-hidden">
          <div
          className="flex items-center justify-between px-4 py-3 text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}>
          
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div className="font-semibold">AI Assistant</div>
            </div>
            <Button size="icon" variant="ghost" className="text-primary-foreground hover:bg-white/20" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
            {messages.map((m, i) =>
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`
              }>
              
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2">
                    <ReactMarkdown>{m.content || (loading ? "…" : "")}</ReactMarkdown>
                  </div>
                </div>
              </div>
          )}
            {loading && messages[messages.length - 1]?.role === "user" &&
          <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
              </div>
          }
          </div>

          <form
          onSubmit={(e) => {e.preventDefault();send();}}
          className="border-t p-3 flex gap-2 bg-card">
          
            <Input
            placeholder="Ask anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading} />
          
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      }
    </>);

}