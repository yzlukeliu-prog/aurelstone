import { defineHandler } from "nitro";
import * as webpush from "web-push";
import { answerFromSite } from "../../../src/lib/desk-knowledge";
import {
  dropSubscription,
  findLearned,
  getOwnedThread,
  getThread,
  learn,
  listLearned,
  listSubscriptions,
  listThreads,
  postReply,
  postVisitor,
  publishLearned,
  redact,
  saveSubscription,
  setStatus,
  unpublishLearned,
  updateLearned,
} from "../../../scripts/desk-store.mjs";
import { toChinese, toEnglish, hasChinese } from "../../../scripts/translate.mjs";

function staffKey() {
  const key = process.env.DESK_KEY || "";
  if (!key || key === "aurelstone") return "";
  return key;
}

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
    const text = String(body.text || "").slice(0, 2000);
    if (!text) {
      event.res.status = 400;
      return { error: "empty" };
    }
    const zh = await toChinese(redact(text));
    const saved = await postVisitor({
      threadId: body.threadId,
      token: body.token,
      text,
      name: body.name,
      zh,
    });
    if (saved?.error) {
      event.res.status = saved.error === "forbidden" ? 403 : 404;
      return { error: saved.error };
    }
    const learned = await findLearned(text);
    const reply = learned?.answer
      ? { text: learned.answer, handoff: false }
      : answerFromSite(text);
    await postReply({
      threadId: saved.thread.id,
      text: reply.text,
      role: "assistant",
      zh: "",
    });
    if (reply.handoff) await setStatus(saved.thread.id, "waiting");
    void notifyPhones(saved.thread, text);
    const thread = await getOwnedThread(saved.thread.id, saved.token);
    return { thread, token: saved.token };
  }

  if (path === "/api/desk/thread" && method === "GET") {
    const thread = await getOwnedThread(url.searchParams.get("id"), url.searchParams.get("token"));
    if (!thread) {
      event.res.status = 403;
      return { error: "forbidden" };
    }
    return { thread };
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
    const note = [body.message, body.materials, body.interests].filter(Boolean).join("\n");
    const zhNote = note ? await toChinese(redact(note)) : "";
    const text = lines.join("\n");
    const zh = [lines.join("\n"), zhNote].filter(Boolean).join("\n");
    const saved = await postVisitor({
      threadId: null,
      text,
      name,
      zh,
    });
    await setStatus(saved.thread.id, "waiting");
    void notifyPhones(saved.thread, text);
    return { ok: true };
  }

  if (path === "/api/desk/answer" && method === "GET") {
    const hit = await findLearned(url.searchParams.get("q") || "");
    return { hit: hit ? { answer: hit.answer } : null };
  }

  if (path === "/api/desk/push-key" && method === "GET") {
    return { key: process.env.VAPID_PUBLIC_KEY || "" };
  }

  const key = staffKey();
  const staff = key && event.req.headers.get("x-desk-key") === key;
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
    let english = raw;
    let zh = "";
    if (hasChinese(raw)) {
      try {
        english = await toEnglish(raw);
        zh = raw;
      } catch {
        event.res.status = 502;
        return { error: "translation_failed" };
      }
    }
    const thread = await postReply({
      threadId: body.threadId,
      text: english,
      role: "staff",
      zh,
    });
    if (!thread) event.res.status = 404;
    return { thread, learned: false };
  }
  if (path === "/api/desk/learn" && method === "POST") {
    const body = await event.req.json().catch(() => ({}));
    const item = await learn({
      question: String(body.question || "").slice(0, 500),
      answer: String(body.answer || "").slice(0, 1000),
      zh: String(body.zh || "").slice(0, 1000),
    });
    if (!item) event.res.status = 400;
    return { item, published: false };
  }
  if (path === "/api/desk/publish" && method === "POST") {
    const body = await event.req.json().catch(() => ({}));
    const item = await publishLearned(String(body.id || ""), {
      question: body.question,
      answer: body.answer,
      zh: body.zh,
    });
    if (!item) {
      event.res.status = 404;
      return { error: "not_found" };
    }
    return { item, published: true };
  }
  if (path === "/api/desk/unpublish" && method === "POST") {
    const body = await event.req.json().catch(() => ({}));
    const item = await unpublishLearned(String(body.id || ""));
    if (!item) {
      event.res.status = 404;
      return { error: "not_found" };
    }
    return { item, published: false };
  }
  if (path === "/api/desk/learn-edit" && method === "POST") {
    const body = await event.req.json().catch(() => ({}));
    const item = await updateLearned(String(body.id || ""), {
      question: body.question,
      answer: body.answer,
      zh: body.zh,
    });
    if (!item) {
      event.res.status = 404;
      return { error: "not_found" };
    }
    return { item };
  }
  if (path === "/api/desk/status" && method === "POST") {
    const body = await event.req.json().catch(() => ({}));
    const thread = await setStatus(body.threadId, body.status);
    if (!thread) event.res.status = 404;
    return { thread };
  }
  if (path === "/api/desk/subscribe" && method === "POST") {
    const body = await event.req.json().catch(() => ({}));
    const saved = await saveSubscription(body.subscription);
    if (!saved) {
      event.res.status = 400;
      return { ok: false, error: "subscribe_failed" };
    }
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
