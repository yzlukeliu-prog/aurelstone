import { defineHandler } from "nitro";
import * as webpush from "web-push";
import {
  dropSubscription,
  findLearned,
  getThread,
  learn,
  listLearned,
  listSubscriptions,
  listThreads,
  postReply,
  postVisitor,
  saveSubscription,
  setStatus,
} from "../../../scripts/desk-store.mjs";
import { toChinese, toEnglish, hasChinese } from "../../../scripts/translate.mjs";

const KEY = process.env.DESK_KEY || "aurelstone";

function pushReady() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

async function notifyPhones(thread, text) {
  try {
    if (!pushReady()) return;
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:desk@aurelstone.com.au",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );
    const subs = await listSubscriptions();
    const payload = JSON.stringify({
      title: "Aurelstone desk",
      body: `${thread.name || "Visitor"}: ${String(text).slice(0, 120)}`,
    });
    await Promise.all(
      subs.map(async (sub) => {
        try {
          const res = await webpush.sendNotification(sub, payload);
          console.log("desk push", res.statusCode, String(sub.endpoint).slice(0, 48));
        } catch (err) {
          console.log("desk push failed", err?.statusCode || 0, err?.body || err?.message);
          if (err?.statusCode === 404 || err?.statusCode === 410) {
            await dropSubscription(sub.endpoint);
          }
        }
      }),
    );
  } catch {
    /* a failed push must not lose the message */
  }
}

export default defineHandler(async (event) => {
  const url = new URL(event.req.url);
  const path = url.pathname;
  const method = event.req.method.toUpperCase();

  if (path === "/api/desk/message" && method === "POST") {
    const body = await event.req.json().catch(() => ({}));
    const role = body.role === "assistant" ? "assistant" : "visitor";
    const text = String(body.text || "").slice(0, 2000);
    const zh = await toChinese(text);
    const thread = await postVisitor({
      threadId: body.threadId,
      text,
      name: body.name,
      role,
      status: body.status,
      zh,
    });
    if (role === "visitor") void notifyPhones(thread, text);
    return { thread };
  }

  if (path === "/api/desk/thread" && method === "GET") {
    return { thread: await getThread(url.searchParams.get("id")) };
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
    const thread = await postVisitor({
      threadId: null,
      text,
      name,
      role: "visitor",
      status: "waiting",
      zh,
    });
    void notifyPhones(thread, text);
    return { thread };
  }

  if (path === "/api/desk/answer" && method === "GET") {
    return { hit: await findLearned(url.searchParams.get("q") || "") };
  }

  if (path === "/api/desk/push-key" && method === "GET") {
    return { key: process.env.VAPID_PUBLIC_KEY || "" };
  }

  const staff = event.req.headers.get("x-desk-key") === KEY;
  if (!staff) {
    event.res.status = 401;
    return { error: "unauthorised" };
  }
  if (path === "/api/desk/threads" && method === "GET") {
    return { threads: await listThreads(), learned: await listLearned() };
  }
  if (path === "/api/desk/reply" && method === "POST") {
    const body = await event.req.json().catch(() => ({}));
    const raw = String(body.text || "").slice(0, 2000);
    const english = hasChinese(raw) ? await toEnglish(raw) : raw;
    const zh = hasChinese(raw) ? raw : "";
    const thread = await postReply({
      threadId: body.threadId,
      text: english,
      role: "staff",
      zh,
    });
    if (thread) {
      const lastVisitor = [...thread.messages].reverse().find((m) => m.role === "visitor");
      if (lastVisitor) await learn({ question: lastVisitor.text, answer: english, zh });
    }
    if (!thread) event.res.status = 404;
    return { thread, learned: true };
  }
  if (path === "/api/desk/status" && method === "POST") {
    const body = await event.req.json().catch(() => ({}));
    const thread = await setStatus(body.threadId, body.status);
    if (!thread) event.res.status = 404;
    return { thread };
  }
  if (path === "/api/desk/subscribe" && method === "POST") {
    const body = await event.req.json().catch(() => ({}));
    await saveSubscription(body.subscription);
    return { ok: true };
  }
  if (path === "/api/desk/test-push" && method === "POST") {
    if (!pushReady()) return { ok: false, reason: "push keys missing" };
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:desk@aurelstone.com.au",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );
    const subs = await listSubscriptions();
    const payload = JSON.stringify({
      title: "Aurelstone desk",
      body: "通知测试。如果看到这条，手机通知已经通了。",
    });
    const results = [];
    for (const sub of subs) {
      try {
        const res = await webpush.sendNotification(sub, payload);
        results.push({ ok: true, status: res.statusCode, endpoint: String(sub.endpoint).slice(0, 48) });
      } catch (err) {
        results.push({
          ok: false,
          status: err?.statusCode || 0,
          endpoint: String(sub.endpoint || "").slice(0, 48),
          error: err?.body || err?.message || "send failed",
        });
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await dropSubscription(sub.endpoint);
        }
      }
    }
    return { count: subs.length, results };
  }
  event.res.status = 404;
  return { error: "not found" };
});
