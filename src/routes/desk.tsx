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
      <Container className="max-w-md py-20">
        <h1 className="font-display text-4xl">Showroom desk</h1>
        <p className="mt-3 text-sm text-muted">Staff only. Visitors never see this page.</p>
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
            setNotice("手机通知已开启。即使关掉客服台，也会收到弹窗。");
          }}
        >
          开启手机通知
        </button>
        {notice ? <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-sm">{notice}</p> : null}
        <p className="mt-2 text-xs text-muted">
          问答草稿 {learned.filter((item) => !item.published).length} 条，已公开 {learned.filter((item) => item.published).length} 条。回复不会自动公开。
        </p>
        <ul className="mt-3 space-y-3">
          {learned.map((item) => (
            <li key={item.id} className="rounded-lg bg-surface px-3 py-3 text-xs">
              <p className="text-muted">{item.published ? "已公开" : "草稿"}</p>
              <label className="mt-2 block text-muted">将公开的问题</label>
              <textarea
                value={edits[item.id]?.question ?? item.question}
                className="mt-1 w-full rounded-md border border-border bg-bg px-2 py-1"
                onChange={(e) => {
                  setEdits((prev) => ({
                    ...prev,
                    [item.id]: {
                      question: e.target.value,
                      answer: prev[item.id]?.answer ?? item.answer,
                    },
                  }));
                }}
              />
              <label className="mt-2 block text-muted">将公开的答案</label>
              <textarea
                value={edits[item.id]?.answer ?? item.answer}
                className="mt-1 w-full rounded-md border border-border bg-bg px-2 py-1"
                onChange={(e) => {
                  setEdits((prev) => ({
                    ...prev,
                    [item.id]: {
                      question: prev[item.id]?.question ?? item.question,
                      answer: e.target.value,
                    },
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
                    if (!res.ok) {
                      setNotice("公开失败，没有发出去。");
                      return;
                    }
                    setNotice("已按上面的文字公开。电话、邮箱和长数字会先被去掉。");
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
                      setNotice(res.ok ? "已撤回，公开接口不再返回。" : "撤回失败。");
                    }}
                  >
                    撤回
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <ul className="mt-6 space-y-2">
          {threads.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setActive(t.id)}
                className="w-full rounded-lg bg-surface px-3 py-3 text-left text-sm"
              >
                <span className="block">{t.name}</span>
                <span className="block truncate text-xs text-muted">
                  {t.messages[t.messages.length - 1]?.zh || t.messages[t.messages.length - 1]?.text || t.status}
                </span>
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
