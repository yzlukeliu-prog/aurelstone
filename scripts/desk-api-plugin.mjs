import {
  findLearned,
  getThread,
  learn,
  listLearned,
  listThreads,
  postReply,
  postVisitor,
  setStatus,
} from "./desk-store.mjs";
import { toChinese, toEnglish, hasChinese } from "./translate.mjs";

const KEY = process.env.DESK_KEY || "aurelstone";

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export function deskApiPlugin() {
  return {
    name: "app-builder:desk-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url || "").split("?", 1)[0];
        if (!path.startsWith("/api/desk")) return next();
        try {
          const method = (req.method || "GET").toUpperCase();
          if (path === "/api/desk/message" && method === "POST") {
            const body = await readBody(req);
            const role = body.role === "assistant" ? "assistant" : "visitor";
            const text = String(body.text || "").slice(0, 2000);
            const zh = role === "visitor" || role === "assistant" ? await toChinese(text) : "";
            const thread = postVisitor({
              threadId: body.threadId,
              text,
              name: body.name,
              role,
              status: body.status,
              zh,
            });
            return send(res, 200, { thread });
          }
          if (path === "/api/desk/thread" && method === "GET") {
            const id = new URL(req.url, "http://local").searchParams.get("id");
            return send(res, 200, { thread: getThread(id) });
          }
          if (path === "/api/desk/enquiry" && method === "POST") {
            const body = await readBody(req);
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
            return send(res, 200, { thread });
          }
          if (path === "/api/desk/answer" && method === "GET") {
            const q = new URL(req.url, "http://local").searchParams.get("q") || "";
            const hit = findLearned(q);
            return send(res, 200, { hit });
          }
          const staff = req.headers["x-desk-key"] === KEY;
          if (!staff) return send(res, 401, { error: "unauthorised" });
          if (path === "/api/desk/threads" && method === "GET") {
            return send(res, 200, { threads: listThreads(), learned: listLearned() });
          }
          if (path === "/api/desk/reply" && method === "POST") {
            const body = await readBody(req);
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
              if (lastVisitor) {
                learn({ question: lastVisitor.text, answer: english, zh });
              }
            }
            return send(res, thread ? 200 : 404, { thread, learned: true });
          }
          if (path === "/api/desk/status" && method === "POST") {
            const body = await readBody(req);
            const thread = setStatus(body.threadId, body.status);
            return send(res, thread ? 200 : 404, { thread });
          }
          return send(res, 404, { error: "not found" });
        } catch (err) {
          return send(res, 400, { error: String(err.message || err) });
        }
      });
    },
  };
}
