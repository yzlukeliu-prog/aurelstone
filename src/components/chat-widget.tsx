import { useEffect, useRef, useState } from "react";
import { answerFromSite } from "@/lib/desk-knowledge";

type Msg = { id: string; role: "visitor" | "assistant" | "staff"; text: string };

type Thread = {
  id: string;
  messages: Msg[];
  status: string;
};

const KEY = "aurelstone-thread";

async function post(path: string, body: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("desk");
  return res.json();
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "hello",
      role: "assistant",
      text: "Ask about the showroom, joinery, SPC floors and walls, or outdoor WPC. We are online 24 hours — message us anytime.",
    },
  ]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved) setThreadId(saved);
  }, []);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages, open]);

  useEffect(() => {
    if (!open || !threadId) return;
    const tick = async () => {
      const res = await fetch(`/api/desk/thread?id=${threadId}`);
      if (!res.ok) return;
      const data = (await res.json()) as { thread: Thread | null };
      if (!data.thread) return;
      const staff = data.thread.messages.filter((m) => m.role === "staff");
      setMessages((prev) => {
        const known = new Set(prev.map((m) => m.id));
        const next = staff.filter((m) => !known.has(m.id));
        return next.length ? [...prev, ...next] : prev;
      });
    };
    const id = window.setInterval(tick, 4000);
    return () => window.clearInterval(id);
  }, [open, threadId]);

  async function send() {
    const value = text.trim();
    if (!value || busy) return;
    setText("");
    setBusy(true);
    const mine: Msg = { id: crypto.randomUUID(), role: "visitor", text: value };
    setMessages((m) => [...m, mine]);
    try {
      const saved = await post("/api/desk/message", { threadId, text: value });
      const id = saved.thread.id as string;
      setThreadId(id);
      localStorage.setItem(KEY, id);
      const learnedRes = await fetch(`/api/desk/answer?q=${encodeURIComponent(value)}`);
      const learned = learnedRes.ok ? await learnedRes.json() : { hit: null };
      const reply = learned.hit
        ? { text: learned.hit.answer, handoff: false }
        : answerFromSite(value);
      const bot: Msg = { id: crypto.randomUUID(), role: "assistant", text: reply.text };
      setMessages((m) => [...m, bot]);
      await post("/api/desk/message", {
        threadId: id,
        text: reply.text,
        role: "assistant",
        status: reply.handoff ? "waiting" : undefined,
      });
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "The desk is briefly unavailable. Call 03 9429 0188 or use the Enquire page.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open ? (
        <div className="mb-3 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
          <div className="flex items-center justify-between bg-accent px-4 py-3 text-accent-fg">
            <div>
              <p className="font-display text-xl leading-none">Aurelstone</p>
              <p className="mt-1 text-xs text-accent-fg/70">Live chat</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-sm">
              Close
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <p
                key={m.id}
                className={
                  m.role === "visitor"
                    ? "ml-8 rounded-lg bg-bg px-3 py-2 text-sm"
                    : "mr-6 rounded-lg bg-bg-elevated px-3 py-2 text-sm text-fg"
                }
              >
                {m.role === "staff" ? <span className="mb-1 block text-xs text-muted">Aurelstone</span> : null}
                {m.text}
              </p>
            ))}
            <div ref={end} />
          </div>
          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask a question"
              className="min-w-0 flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none"
            />
            <button type="submit" className="rounded-md bg-accent px-3 text-sm text-accent-fg">
              Send
            </button>
          </form>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ml-auto block rounded-full bg-accent px-5 py-3 text-sm text-accent-fg"
      >
        {open ? "Hide" : "Live chat"}
      </button>
    </div>
  );
}
