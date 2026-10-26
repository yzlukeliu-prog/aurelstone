import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const file = join(process.cwd(), "data", "desk.json");

function load() {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return { threads: [] };
  }
}

function save(data) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2));
}

function id() {
  return Math.random().toString(36).slice(2, 10);
}

export function listThreads() {
  const data = load();
  return data.threads
    .slice()
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export function getThread(threadId) {
  return load().threads.find((t) => t.id === threadId) || null;
}

export function postVisitor({ threadId, text, name, role = "visitor", status, zh }) {
  const data = load();
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
  save(data);
  return thread;
}

export function postReply({ threadId, text, role, zh }) {
  const data = load();
  const thread = data.threads.find((t) => t.id === threadId);
  if (!thread) return null;
  const now = new Date().toISOString();
  thread.updatedAt = now;
  thread.status = role === "staff" ? "staff" : thread.status;
  thread.messages.push({ id: id(), role, text, zh: zh || "", at: now });
  save(data);
  return thread;
}

export function setStatus(threadId, status) {
  const data = load();
  const thread = data.threads.find((t) => t.id === threadId);
  if (!thread) return null;
  thread.status = status;
  thread.updatedAt = new Date().toISOString();
  save(data);
  return thread;
}


function tokens(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

export function learn({ question, answer, zh }) {
  if (!question || !answer) return null;
  const data = load();
  data.learned = data.learned || [];
  const item = {
    id: id(),
    question,
    answer,
    zh: zh || "",
    at: new Date().toISOString(),
  };
  data.learned.unshift(item);
  data.learned = data.learned.slice(0, 200);
  save(data);
  return item;
}

export function findLearned(question) {
  const data = load();
  const learned = data.learned || [];
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
  return bestScore >= 0.34 ? best : null;
}

export function listLearned() {
  return load().learned || [];
}
