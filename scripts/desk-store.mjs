import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { get, put } from "@vercel/blob";

const file = join(process.cwd(), "data", "desk.json");
const BLOB = "desk.json";

function token() {
  return process.env.BLOB_READ_WRITE_TOKEN || "";
}

function empty() {
  return { threads: [], learned: [], subscriptions: [] };
}

function loadFile() {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return empty();
  }
}

function saveFile(data) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2));
}

function version(etag) {
  return String(etag || "").replace(/^W\//, "").replace(/^"|"$/g, "");
}

async function loadBlob() {
  const result = await get(BLOB, {
    access: "private",
    useCache: false,
    token: token(),
  });
  if (!result || result.statusCode !== 200 || !result.stream) return { data: empty(), etag: "" };
  const text = await new Response(result.stream).text();
  return { data: JSON.parse(text), etag: version(result.blob?.etag || "") };
}

function isConflict(err) {
  const name = err?.name || err?.cause?.name || "";
  const text = `${name} ${err?.message || ""} ${err?.cause?.message || ""} ${err}`;
  return /precondition|already exists|conflicting operation|conditional request/i.test(text);
}

async function saveBlob(data, etag) {
  await put(BLOB, JSON.stringify(data), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: Boolean(etag),
    contentType: "application/json",
    token: token(),
    ...(etag ? { ifMatch: etag } : {}),
  });
}

let chain = Promise.resolve();
function locked(fn) {
  const run = chain.then(fn, fn);
  chain = run.then(() => {}, () => {});
  return run;
}

async function load() {
  if (!token()) return { data: loadFile(), etag: "" };
  return loadBlob();
}

async function save(data, etag) {
  if (!token()) return saveFile(data);
  return saveBlob(data, etag);
}

async function update(fn) {
  return locked(async () => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const { data, etag } = await load();
      const next = fn(data);
      try {
        await save(data, etag);
        return next;
      } catch (err) {
        if (!isConflict(err) || attempt === 19) throw err;
        await new Promise((resolve) => setTimeout(resolve, 40 + Math.random() * 160));
      }
    }
  });
}

function id() {
  return Math.random().toString(36).slice(2, 10);
}

export async function listThreads() {
  const { data } = await load();
  return (data.threads || [])
    .slice()
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export async function getThread(threadId) {
  const { data } = await load();
  return (data.threads || []).find((t) => t.id === threadId) || null;
}

export async function postVisitor({ threadId, text, name, role = "visitor", status, zh }) {
  return update((data) => {
    data.threads = data.threads || [];
    const now = new Date().toISOString();
    let thread = threadId ? data.threads.find((t) => t.id === threadId) : null;
    if (!thread) {
      thread = {
        id: id(),
        name: name || "Visitor",
        createdAt: now,
        updatedAt: now,
        status: "open",
        messages: [],
      };
      data.threads.unshift(thread);
    }
    thread.updatedAt = now;
    if (status) thread.status = status;
    thread.messages.push({ id: id(), role, text, zh: zh || "", at: now });
    return thread;
  });
}

export async function postReply({ threadId, text, role, zh }) {
  return update((data) => {
    const thread = (data.threads || []).find((t) => t.id === threadId);
    if (!thread) return null;
    const now = new Date().toISOString();
    thread.updatedAt = now;
    thread.status = role === "staff" ? "staff" : thread.status;
    thread.messages.push({ id: id(), role, text, zh: zh || "", at: now });
    return thread;
  });
}

export async function setStatus(threadId, status) {
  return update((data) => {
    const thread = (data.threads || []).find((t) => t.id === threadId);
    if (!thread) return null;
    thread.status = status;
    thread.updatedAt = new Date().toISOString();
    return thread;
  });
}

function tokens(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function redact(text) {
  return String(text || "")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/(?:\+?61|0)(?:[\d()-][\d\s()-]{7,})/g, "[phone]")
    .replace(/\b\d{6,}\b/g, "[number]")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function learn({ question, answer, zh }) {
  const cleanQuestion = redact(question);
  const cleanAnswer = redact(answer);
  const cleanZh = redact(zh);
  if (!cleanQuestion || !cleanAnswer) return null;
  return update((data) => {
    data.learned = data.learned || [];
    const item = {
      id: id(),
      question: cleanQuestion,
      answer: cleanAnswer,
      zh: cleanZh,
      published: false,
      at: new Date().toISOString(),
    };
    data.learned.unshift(item);
    data.learned = data.learned.slice(0, 200);
    return item;
  });
}

export async function publishLearned(itemId) {
  return update((data) => {
    const item = (data.learned || []).find((entry) => entry.id === itemId);
    if (!item) return null;
    item.question = redact(item.question);
    item.answer = redact(item.answer);
    item.zh = redact(item.zh);
    item.published = true;
    return item;
  });
}

export async function findLearned(question) {
  const { data } = await load();
  const learned = (data.learned || []).filter((item) => item.published === true);
  const q = new Set(tokens(question));
  if (!q.size) return null;
  let best = null;
  let bestScore = 0;
  for (const item of learned) {
    const t = tokens(item.question);
    if (!t.length) continue;
    const shared = t.filter((w) => q.has(w)).length;
    const score = shared / Math.max(t.length, q.size);
    if (shared >= 2 && score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  return bestScore >= 0.34 ? { answer: redact(best.answer) } : null;
}

export async function listLearned() {
  const { data } = await load();
  return (data.learned || []).map((item) => ({
    ...item,
    published: item.published === true,
  }));
}

export async function listSubscriptions() {
  const { data } = await load();
  return data.subscriptions || [];
}

export async function saveSubscription(sub) {
  if (!sub?.endpoint) return null;
  return update((data) => {
    data.subscriptions = data.subscriptions || [];
    const existing = data.subscriptions.find((s) => s.endpoint === sub.endpoint);
    if (existing) Object.assign(existing, sub);
    else data.subscriptions.push(sub);
    return sub;
  });
}

export async function dropSubscription(endpoint) {
  return update((data) => {
    data.subscriptions = (data.subscriptions || []).filter((s) => s.endpoint !== endpoint);
    return true;
  });
}
