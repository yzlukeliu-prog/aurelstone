import { defineHandler } from "nitro";
import {
  findLearned,
  getThread,
  learn,
  listLearned,
  listThreads,
  postReply,
  postVisitor,
  setStatus,
} from "../../../scripts/desk-store.mjs";
import { toChinese, toEnglish, hasChinese } from "../../../scripts/translate.mjs";

const KEY = process.env.DESK_KEY || "aurelstone";

export default defineHandler(async (event) => {
  const url = new URL(event.req.url);
  const path = url.pathname;
  const method = event.req.method.toUpperCase();

  if (path === "/api/desk/message" && method === "POST") {
    const body = await event.req.json().catch(() => ({}));
    const role = body.role === "assistant" ? "assistant" : "visitor";
    const text = String(body.text || "").slice(0, 2000);
    const zh = await toChinese(text);
    const thread = postVisitor({
      threadId: body.threadId,
      text,
      name: body.name,
      role,
      status: body.status,
      zh,
    });
    return { thread };
  }

  if (path === "/api/desk/thread" && method === "GET") {
    return { thread: getThread(url.searchParams.get("id")) };
  }

  if (path === "/api/desk/enquiry" && method === "POST") {
    const body = await event.req.json().catch(() => ({}));
    const kind = String(body.kind || "enquiry");
    const name = String(body.name || "Visitor").slice(0, 80);
    const lines = [
      kind === "sample" ? "Sample request" : kind === "visit" ? "Showroom visit" : "Project enquiry",
      `Name: ${name}`,
      body.phone ? `Phone: ${body.phone}` : "",
      body.email ? `Email: ${body.email}` : "",
      body.suburb ? `Suburb: ${body.suburb}` : "",
      body.date ? `Date: ${body.date}${body.time ? " " + body.time : ""}` : "",
      body.materials ? `Samples: ${body.materials}` : "",
      body.interests ? `Interests: ${body.interests}` : "",
      body.message ? `Note: ${body.message}` : "",
    ].filter(Boolean);
    const text = lines.join("\n");
    const zh = await toChinese(text);
    const thread = postVisitor({
      threadId: null,
      text,
      name,
      role: "visitor",
      status: "waiting",
      zh,
    });
    return { thread };
  }

  if (path === "/api/desk/answer" && method === "GET") {
    return { hit: findLearned(url.searchParams.get("q") || "") };
  }

  const staff = event.req.headers.get("x-desk-key") === KEY;
  if (!staff) {
    event.res.status = 401;
    return { error: "unauthorised" };
  }
  if (path === "/api/desk/threads" && method === "GET") {
    return { threads: listThreads(), learned: listLearned() };
  }
  if (path === "/api/desk/reply" && method === "POST") {
    const body = await event.req.json().catch(() => ({}));
    const raw = String(body.text || "").slice(0, 2000);
    const english = hasChinese(raw) ? await toEnglish(raw) : raw;
    const zh = hasChinese(raw) ? raw : "";
    const thread = postReply({
      threadId: body.threadId,
      text: english,
      role: "staff",
      zh,
    });
    if (thread) {
      const lastVisitor = [...thread.messages].reverse().find((m) => m.role === "visitor");
      if (lastVisitor) learn({ question: lastVisitor.text, answer: english, zh });
    }
    if (!thread) event.res.status = 404;
    return { thread, learned: true };
  }
  if (path === "/api/desk/status" && method === "POST") {
    const body = await event.req.json().catch(() => ({}));
    const thread = setStatus(body.threadId, body.status);
    if (!thread) event.res.status = 404;
    return { thread };
  }
  event.res.status = 404;
  return { error: "not found" };
});
