import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

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
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
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

function readSavedKey() {
  try {
    const stored = localStorage.getItem(KEY_NAME);
    if (stored) return stored;
  } catch { /* private mode */ }
  const match = document.cookie.match(/(?:^|; )aurelstone-desk-key=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function rememberKey(value: string) {
  try { localStorage.setItem(KEY_NAME, value); } catch { /* ignore */ }
  document.cookie = `aurelstone-desk-key=${encodeURIComponent(value)}; Max-Age=31536000; Path=/; SameSite=Lax`;
}

function DeskPage() {
  const [key, setKey] = useState("");
  const [ready, setReady] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [learned, setLearned] = useState<{ id: string; question: string; answer: string; published?: boolean }[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [edits, setEdits] = useState<Record<string, { question: string; answer: string }>>({});
  const [notice, setNotice] = useState("");
  const [draftsOpen, setDraftsOpen] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const seen = useRef<Set<string>>(new Set());
  const primed = useRef(false);
  const lastMsg = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const saved = readSavedKey();
    if (saved) {
      setKey(saved);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready || Notification.permission !== "granted" || !("serviceWorker" in navigator)) return;
    const enable = async () => {
      const reg = await navigator.serviceWorker.register("/desk-sw.js");
      const keyRes = await fetch("/api/desk/push-key");
      const { key: publicKey } = await keyRes.json();
      if (!publicKey) return;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });
      await fetch("/api/desk/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json", "x-desk-key": key },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
    };
    void enable().catch(() => {});
  }, [ready, key]);

  useEffect(() => {
    if (!ready) return;
    const load = async () => {
      const res = await fetch("/api/desk/threads", { headers: { "x-desk-key": key } });
      if (!res.ok) {
        setError("Key not accepted.");
        setReady(false);
        return;
      }
      const data = (await res.json()) as { threads: Thread[]; learned?: { id: string; question: string; answer: string; published?: boolean }[] };
      const incoming = data.threads.filter((t) => {
        const last = t.messages[t.messages.length - 1];
        const prev = lastMsg.current.get(t.id);
        return last && last.role === "visitor" && last.id !== prev;
      });
      if (primed.current && incoming.length) {
        const first = incoming[0];
        const last = first.messages[first.messages.length - 1];
        setNotice(`${first.name}：${last.zh || last.text}`);
        try { chime(); } catch { /* sound needs a user gesture on some phones */ }
        if (Notification.permission === "granted") {
          new Notification("Aurelstone desk", { body: `${first.name}: ${last.text}` });
        }
      }
      for (const t of data.threads) {
        seen.current.add(t.id);
        const last = t.messages[t.messages.length - 1];
        if (last) lastMsg.current.set(t.id, last.id);
      }
      primed.current = true;
      setThreads(data.threads);
      setLearned(data.learned || []);
      setActive((id) => id);
    };
    void load();
    const timer = window.setInterval(load, 4000);
    return () => window.clearInterval(timer);
  }, [ready, key]);

  const current = threads.find((t) => t.id === active);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [current?.messages.length, active]);

  async function reply() {
    if (!current || !text.trim()) return;
    const res = await fetch("/api/desk/reply", {
      method: "POST",
      headers: { "content-type": "application/json", "x-desk-key": key },
      body: JSON.stringify({ threadId: current.id, text: text.trim() }),
    });
    const data = (await res.json().catch(() => ({}))) as { thread?: Thread; error?: string };
    if (!res.ok || !data.thread) {
      setNotice(data.error === "translation_failed" ? "翻译失败，中文没有发给客人。" : "发送失败，请再试一次。");
      return;
    }
    setThreads((list) => list.map((t) => (t.id === data.thread!.id ? data.thread! : t)));
    setText("");
    setNotice("");
  }

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
        <p className="text-xs tracking-[0.2em] text-muted">AURELSTONE</p>
        <h1 className="mt-2 font-display text-4xl">Desk</h1>
        <p className="mt-3 text-sm text-muted">员工客服客户端。客人看不到这个页面。</p>
        <form
          className="mt-8 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            rememberKey(key);
            setReady(true);
          }}
        >
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            type="password"
            placeholder="密码"
            className="min-w-0 flex-1 rounded-full border border-border bg-surface px-4 py-3 text-base outline-none"
          />
          <button className="rounded-full bg-accent px-5 text-sm text-accent-fg">进入</button>
        </form>
        {error ? <p className="mt-3 text-sm">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-6xl min-w-0 overflow-hidden bg-bg md:grid md:grid-cols-12">
      <aside className={`${current ? "hidden" : "flex"} min-w-0 flex-col md:col-span-4 md:flex md:border-r md:border-border`}>
        <div className="px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl">Desk</h1>
            <button type="button" className="text-xs underline" onClick={() => setDraftsOpen((v) => !v)}>
              问答 {learned.length}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted">客人英文下面是中文。你用中文回，客人看到英文。</p>
          <button
            type="button"
            className="mt-3 text-sm underline"
            onClick={async () => {
              const permission = await Notification.requestPermission();
              try { chime(); } catch { /* ignore */ }
              if (permission !== "granted" || !("serviceWorker" in navigator)) return;
              const reg = await navigator.serviceWorker.register("/desk-sw.js");
              const keyRes = await fetch("/api/desk/push-key");
              const { key: publicKey } = await keyRes.json();
              if (!publicKey) return;
              const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: publicKey,
              });
              const saved = await fetch("/api/desk/subscribe", {
                method: "POST",
                headers: { "content-type": "application/json", "x-desk-key": key },
                body: JSON.stringify({ subscription: sub.toJSON() }),
              });
              const result = (await saved.json().catch(() => ({}))) as { ok?: boolean };
              if (!saved.ok || !result.ok) {
                setNotice("手机通知没有开启，请再试一次。");
                return;
              }
              setNotice("手机通知已开启。");
            }}
          >
            开启手机通知
          </button>
          {notice ? <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-sm">{notice}</p> : null}
        </div>
        {draftsOpen ? (
          <ul className="max-h-64 space-y-3 overflow-y-auto px-4 pb-4">
            {learned.map((item) => (
              <li key={item.id} className="rounded-lg bg-surface px-3 py-3 text-xs">
                <p className="text-muted">{item.published ? "已公开" : "草稿"}</p>
                <textarea
                  value={edits[item.id]?.question ?? item.question}
                  className="mt-2 w-full rounded-md border border-border bg-bg px-2 py-1"
                  onChange={(e) => {
                    setEdits((prev) => ({
                      ...prev,
                      [item.id]: { question: e.target.value, answer: prev[item.id]?.answer ?? item.answer },
                    }));
                  }}
                />
                <textarea
                  value={edits[item.id]?.answer ?? item.answer}
                  className="mt-2 w-full rounded-md border border-border bg-bg px-2 py-1"
                  onChange={(e) => {
                    setEdits((prev) => ({
                      ...prev,
                      [item.id]: { question: prev[item.id]?.question ?? item.question, answer: e.target.value },
                    }));
                  }}
                />
                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    className="underline"
                    onClick={async () => {
                      const question = edits[item.id]?.question ?? item.question;
                      const answer = edits[item.id]?.answer ?? item.answer;
                      const res = await fetch("/api/desk/publish", {
                        method: "POST",
                        headers: { "content-type": "application/json", "x-desk-key": key },
                        body: JSON.stringify({ id: item.id, question, answer }),
                      });
                      setNotice(res.ok ? "已公开。" : "公开失败。");
                    }}
                  >
                    确认公开
                  </button>
                  {item.published ? (
                    <button
                      type="button"
                      className="underline"
                      onClick={async () => {
                        const res = await fetch("/api/desk/unpublish", {
                          method: "POST",
                          headers: { "content-type": "application/json", "x-desk-key": key },
                          body: JSON.stringify({ id: item.id }),
                        });
                        setNotice(res.ok ? "已撤回。" : "撤回失败。");
                      }}
                    >
                      撤回
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-6">
          {threads.map((t) => {
            const last = t.messages[t.messages.length - 1];
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setActive(t.id)}
                  className={`w-full min-w-0 rounded-xl px-3 py-3 text-left ${active === t.id ? "bg-surface" : ""}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm">{t.name}</span>
                    <span className="shrink-0 text-[11px] text-muted">{t.status === "waiting" ? "待回复" : ""}</span>
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted">
                    {last?.zh || last?.text || "新对话"}
                  </span>
                </button>
              </li>
            );
          })}
          {threads.length === 0 ? <li className="px-2 py-6 text-sm text-muted">还没有客人消息。</li> : null}
        </ul>
      </aside>
      <section className={`${current ? "flex" : "hidden"} min-w-0 flex-col md:col-span-8 md:flex`}>
        {current ? (
          <>
            <div className="flex items-center gap-3 border-b border-border px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
              <button type="button" className="text-sm md:hidden" onClick={() => setActive(null)}>返回</button>
              <div className="min-w-0">
                <p className="truncate text-sm">{current.name}</p>
                <p className="text-[11px] text-muted">{current.status === "waiting" ? "待回复" : "对话中"}</p>
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4">
              {current.messages.map((m) => {
                const mine = m.role === "staff";
                const assistant = m.role === "assistant";
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] min-w-0 break-words rounded-2xl px-3 py-2 text-sm ${mine ? "bg-accent text-accent-fg" : assistant ? "bg-bg-elevated" : "bg-surface"}`}>
                      <p className={`text-[11px] ${mine ? "text-accent-fg/70" : "text-muted"}`}>
                        {mine ? "你" : assistant ? "助手" : "客人"}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap break-words">{mine && m.zh ? m.zh : m.text}</p>
                      <p className={`mt-1 whitespace-pre-wrap break-words text-xs ${mine ? "text-accent-fg/70" : "text-muted"}`}>
                        {mine ? m.text : m.zh || "翻译未返回"}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={end} />
            </div>
            <form
              className="flex gap-2 border-t border-border px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
              onSubmit={(e) => {
                e.preventDefault();
                void reply();
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="用中文回复"
                className="min-w-0 flex-1 rounded-full border border-border bg-surface px-4 py-3 text-base outline-none"
              />
              <button className="rounded-full bg-accent px-5 text-sm text-accent-fg">发送</button>
            </form>
          </>
        ) : (
          <div className="hidden flex-1 items-center justify-center text-sm text-muted md:flex">选择一个对话</div>
        )}
      </section>
    </div>
  );
}
