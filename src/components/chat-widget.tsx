import { useEffect, useRef, useState } from "react";

type Msg = { id: string; role: "visitor" | "assistant" | "staff"; text: string };

type Thread = {
  id: string;
  messages: Msg[];
  status: string;
};

const KEY = "aurelstone-thread";

function readSession() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: string; token?: string };
    if (parsed.id && parsed.token) return parsed;
  } catch {
    /* old id-only value is no longer valid */
  }
  return null;
}

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
  const [session, setSession] = useState<{ id: string; token: string } | null>(null);
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
    const saved = readSession();
    if (saved) setSession(saved);
  }, []);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages, open]);

  useEffect(() => {
    if (!open || !session) return;
    const tick = async () => {
      const res = await fetch(`/api/desk/thread?id=${session.id}&token=${session.token}`);
      if (res.status === 403) {
        localStorage.removeItem(KEY);
        setSession(null);
        return;
      }
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
  }, [open, session]);

  async function send() {
    const value = text.trim();
    if (!value || busy) return;
    setText("");
    setBusy(true);
    const mine: Msg = { id: crypto.randomUUID(), role: "visitor", text: value };
    setMessages((m) => [...m, mine]);
    try {
      const saved = await post("/api/desk/message", {
        threadId: session?.id,
        token: session?.token,
        text: value,
      });
      const next = { id: saved.thread.id as string, token: saved.token as string };
      setSession(next);
      localStorage.setItem(KEY, JSON.stringify(next));
      const assistant = (saved.thread.messages as Msg[]).filter((m) => m.role === "assistant").at(-1);
      if (assistant) setMessages((m) => [...m, assistant]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "The desk is briefly unavailable. Please use the Enquire page.",
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
          <p className="px-3 pb-3 text-[11px] text-muted">
            Messages are stored for the showroom. Phone numbers and emails are removed before any translation.
          </p>
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
