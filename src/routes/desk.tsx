import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/site-shell";

function chime() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

export const Route = createFileRoute("/desk")({
  head: () => ({
    meta: [
      { title: "Desk — Aurelstone" },
      { name: "robots", content: "noindex" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Desk" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    ],
    links: [
      { rel: "manifest", href: "/desk.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: DeskPage,
});

type Msg = { id: string; role: string; text: string; zh?: string; at: string };
type Thread = {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
  messages: Msg[];
};

const KEY_NAME = "aurelstone-desk-key";

function DeskPage() {
  const [key, setKey] = useState("");
  const [ready, setReady] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [learned, setLearned] = useState<{ question: string; answer: string }[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const seen = useRef<Set<string>>(new Set());
  const primed = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY_NAME);
    if (saved) {
      setKey(saved);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    const load = async () => {
      const res = await fetch("/api/desk/threads", { headers: { "x-desk-key": key } });
      if (!res.ok) {
        setError("Key not accepted.");
        setReady(false);
        return;
      }
      const data = (await res.json()) as { threads: Thread[]; learned?: { question: string; answer: string }[] };
      const incoming = data.threads.filter((t) => !seen.current.has(t.id));
      if (primed.current && incoming.length) {
        const first = incoming[0];
        setNotice(`${first.name} 有新消息`);
        try { chime(); } catch { /* sound needs a user gesture on some phones */ }
        if (Notification.permission === "granted") {
          new Notification("Aurelstone desk", { body: `${first.name} sent a request` });
        }
      }
      for (const t of data.threads) seen.current.add(t.id);
      primed.current = true;
      setThreads(data.threads);
      setLearned(data.learned || []);
      setActive((id) => id || data.threads[0]?.id || null);
    };
    void load();
    const timer = window.setInterval(load, 4000);
    return () => window.clearInterval(timer);
  }, [ready, key]);

  const current = threads.find((t) => t.id === active);

  async function reply() {
    if (!current || !text.trim()) return;
    const res = await fetch("/api/desk/reply", {
      method: "POST",
      headers: { "content-type": "application/json", "x-desk-key": key },
      body: JSON.stringify({ threadId: current.id, text: text.trim() }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { thread: Thread };
    setThreads((list) => list.map((t) => (t.id === data.thread.id ? data.thread : t)));
    setText("");
  }

  if (!ready) {
    return (
      <Container className="max-w-md py-20">
        <h1 className="font-display text-4xl">Showroom desk</h1>
        <p className="mt-3 text-sm text-muted">Staff only. Visitors never see this page.</p>
        <form
          className="mt-8 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            localStorage.setItem(KEY_NAME, key);
            setReady(true);
          }}
        >
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            type="password"
            placeholder="Desk key"
            className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-accent px-4 text-sm text-accent-fg">Enter</button>
        </form>
        {error ? <p className="mt-3 text-sm">{error}</p> : null}
      </Container>
    );
  }

  return (
    <Container className="grid gap-8 py-10 md:grid-cols-12">
      <aside className="md:col-span-4">
        <h1 className="font-display text-3xl">Desk</h1>
        <p className="mt-2 text-sm text-muted">客人英文下面是中文。你用中文回复，客人看到英文。样品、预约、询价也会出现在这里，有新单会响一声。</p>
        <button
          type="button"
          className="mt-3 text-sm underline"
          onClick={() => {
            void Notification.requestPermission();
            try { chime(); } catch { /* ignore */ }
          }}
        >
          开启提示音和弹窗
        </button>
        {notice ? <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-sm">{notice}</p> : null}
        <p className="mt-2 text-xs text-muted">已记住 {learned.length} 条</p>
        <ul className="mt-6 space-y-2">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setActive(t.id)}
                className="w-full rounded-lg bg-surface px-3 py-3 text-left text-sm"
              >
                <span className="block">{t.name}</span>
                <span className="text-xs text-muted">{t.status}</span>
              </button>
            </li>
          ))}
          {threads.length === 0 ? <li className="text-sm text-muted">No conversations yet.</li> : null}
        </ul>
      </aside>
      <section className="md:col-span-8">
        {current ? (
          <div className="flex min-h-[28rem] flex-col rounded-xl bg-surface p-4">
            <div className="flex-1 space-y-3 overflow-y-auto">
              {current.messages.map((m) => (
                <div key={m.id} className="rounded-lg bg-bg px-3 py-3 text-sm">
                  <span className="mb-2 block text-xs text-muted">
                    {m.role === "visitor" ? "客人" : m.role === "staff" ? "你" : "助手"}
                  </span>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted">原文</p>
                      <p className="mt-1">{m.role === "staff" && m.zh ? m.zh : m.text}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted">
                        {m.role === "staff" ? "发给客人的英文" : "中文"}
                      </p>
                      <p className="mt-1 text-muted">
                        {m.role === "staff" ? m.text : m.zh || "翻译未返回"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void reply();
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Reply as Aurelstone"
                className="flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm"
              />
              <button className="rounded-md bg-accent px-4 text-sm text-accent-fg">Send</button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-muted">Select a conversation.</p>
        )}
      </section>
    </Container>
  );
}
