import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { get, put } from "@vercel/blob";

const file = join(process.cwd(), "data", "desk.json");
const BLOB = "desk.json";
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function empty() {
  return { threads: [], learned: [] };
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

async function loadBlob() {
  try {
    const result = await get(BLOB, { access: "private", token: process.env.BLOB_READ_WRITE_TOKEN });
    if (!result || result.statusCode !== 200 || !result.stream) return empty();
    const text = await new Response(result.stream).text();
    return JSON.parse(text);
  } catch {
    return empty();
  }
}

async function saveBlob(data) {
  await put(BLOB, JSON.stringify(data), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

let chain = Promise.resolve();
function locked(fn) {
  const run = chain.then(fn, fn);
  chain = run.then(() => {}, () => {});
  return run;
}

async function load() {
  return useBlob ? loadBlob() : loadFile();
}

async function save(data) {
  return useBlob ? saveBlob(data) : saveFile(data);
}

function id() {
  return Math.random().toString(36).slice(2, 10);
}

export async function listThreads() {
  const data = await load();
  return (data.threads || [])
    .slice()
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
}

export async function getThread(threadId) {
  const data = await load();
  return (data.threads || []).find((t) => t.id === threadId) || null;
}

export async function postVisitor({ threadId, text, name, role = "visitor", status, zh }) {
  return locked(async () => {
    const data = await load();
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
    await save(data);
    return thread;
  });
}

export async function postReply({ threadId, text, role, zh }) {
  return locked(async () => {
    const data = await load();
    const thread = (data.threads || []).find((t) => t.id === threadId);
    if (!thread) return null;
    const now = new Date().toISOString();
    thread.updatedAt = now;
    thread.status = role === "staff" ? "staff" : thread.status;
    thread.messages.push({ id: id(), role, text, zh: zh || "", at: now });
    await save(data);
    return thread;
  });
}

export async function setStatus(threadId, status) {
  return locked(async () => {
    const data = await load();
    const thread = (data.threads || []).find((t) => t.id === threadId);
    if (!thread) return null;
    thread.status = status;
    thread.updatedAt = new Date().toISOString();
    await save(data);
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

export async function learn({ question, answer, zh }) {
  if (!question || !answer) return null;
  return locked(async () => {
    const data = await load();
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
    await save(data);
    return item;
  });
}

export async function findLearned(question) {
  const data = await load();
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

export async function listLearned() {
  const data = await load();
  return data.learned || [];
}
