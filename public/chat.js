(function () {
  if (window.__aurelstoneChat) return;
  window.__aurelstoneChat = true;

  var script = document.currentScript;
  var base = script && script.src ? new URL(script.src).origin : "https://aurelstone.vercel.app";
  var KEY = "aurelstone-thread";

  function readSession() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed.id && parsed.token) return parsed;
    } catch (e) {}
    return null;
  }

  function saveSession(session) {
    try { localStorage.setItem(KEY, JSON.stringify(session)); } catch (e) {}
  }

  var session = readSession();
  var open = false;
  var messages = [{
    id: "hello",
    role: "assistant",
    text: "Ask about the showroom, joinery, SPC floors and walls, or outdoor WPC. We are online 24 hours — message us anytime."
  }];

  var root = document.createElement("div");
  root.setAttribute("data-aurelstone-chat", "");
  root.style.cssText = "position:fixed;right:20px;bottom:20px;z-index:2147483000;font-family:Georgia,Times New Roman,serif;color:#1c1917;";
  document.body.appendChild(root);

  var panel = document.createElement("div");
  panel.style.cssText = "display:none;width:min(22rem,calc(100vw - 40px));height:min(32rem,calc(100vh - 110px));margin-bottom:12px;background:#f7f3ee;border:1px solid #e6dfd4;border-radius:16px;box-shadow:0 18px 50px rgba(28,25,23,.18);overflow:hidden;flex-direction:column;";
  root.appendChild(panel);

  var head = document.createElement("div");
  head.style.cssText = "display:flex;align-items:center;justify-content:space-between;background:#1c1917;color:#f7f3ee;padding:14px 16px;";
  head.innerHTML = '<div><div style="font-size:20px;line-height:1">Aurelstone</div><div style="margin-top:4px;font-size:12px;opacity:.7;font-family:system-ui,sans-serif">Live chat</div></div>';
  var close = document.createElement("button");
  close.type = "button";
  close.textContent = "Close";
  close.style.cssText = "background:none;border:0;color:#f7f3ee;font-size:13px;font-family:system-ui,sans-serif;cursor:pointer;";
  head.appendChild(close);
  panel.appendChild(head);

  var list = document.createElement("div");
  list.style.cssText = "flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;font-family:system-ui,sans-serif;";
  panel.appendChild(list);

  var form = document.createElement("form");
  form.style.cssText = "display:flex;gap:8px;border-top:1px solid #e6dfd4;padding:12px;";
  var input = document.createElement("input");
  input.placeholder = "Ask a question";
  input.style.cssText = "flex:1;min-width:0;border:1px solid #e6dfd4;border-radius:8px;background:#fff;padding:10px 12px;font-size:14px;font-family:system-ui,sans-serif;outline:none;";
  var send = document.createElement("button");
  send.type = "submit";
  send.textContent = "Send";
  send.style.cssText = "border:0;border-radius:8px;background:#1c1917;color:#f7f3ee;padding:0 14px;font-size:14px;font-family:system-ui,sans-serif;cursor:pointer;";
  form.appendChild(input);
  form.appendChild(send);
  panel.appendChild(form);

  var note = document.createElement("p");
  note.textContent = "Messages are stored for the showroom. Phone numbers and emails are removed before any translation.";
  note.style.cssText = "margin:0;padding:0 12px 12px;font-size:11px;color:#7a7268;font-family:system-ui,sans-serif;";
  panel.appendChild(note);

  var button = document.createElement("button");
  button.type = "button";
  button.textContent = "Live chat";
  button.style.cssText = "display:block;margin-left:auto;border:0;border-radius:999px;background:#1c1917;color:#f7f3ee;padding:12px 20px;font-size:14px;font-family:system-ui,sans-serif;cursor:pointer;box-shadow:0 10px 24px rgba(28,25,23,.2);";
  root.appendChild(button);

  function bubble(msg) {
    var p = document.createElement("p");
    p.style.cssText = msg.role === "visitor"
      ? "margin:0 0 0 32px;background:#fff;border-radius:10px;padding:8px 12px;font-size:14px;line-height:1.45;"
      : "margin:0 24px 0 0;background:#efe9e1;border-radius:10px;padding:8px 12px;font-size:14px;line-height:1.45;";
    if (msg.role === "staff") {
      var who = document.createElement("span");
      who.textContent = "Aurelstone";
      who.style.cssText = "display:block;margin-bottom:4px;font-size:11px;color:#7a7268;";
      p.appendChild(who);
    }
    p.appendChild(document.createTextNode(msg.text));
    return p;
  }

  function render() {
    list.innerHTML = "";
    messages.forEach(function (msg) { list.appendChild(bubble(msg)); });
    list.scrollTop = list.scrollHeight;
  }

  function setOpen(next) {
    open = next;
    panel.style.display = open ? "flex" : "none";
    button.textContent = open ? "Hide" : "Live chat";
    if (open) input.focus();
  }

  button.addEventListener("click", function () { setOpen(!open); });
  close.addEventListener("click", function () { setOpen(false); });

  var busy = false;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = input.value.trim();
    if (!value || busy) return;
    input.value = "";
    busy = true;
    messages.push({ id: String(Date.now()), role: "visitor", text: value });
    render();
    fetch(base + "/api/desk/message", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ threadId: session && session.id, token: session && session.token, text: value })
    }).then(function (res) {
      if (!res.ok) throw new Error("desk");
      return res.json();
    }).then(function (saved) {
      session = { id: saved.thread.id, token: saved.token };
      saveSession(session);
      var assistant = (saved.thread.messages || []).filter(function (m) { return m.role === "assistant"; }).slice(-1)[0];
      if (assistant) messages.push(assistant);
      render();
    }).catch(function () {
      messages.push({
        id: String(Date.now()),
        role: "assistant",
        text: "The desk is briefly unavailable. Please call 0405 527 839."
      });
      render();
    }).finally(function () { busy = false; });
  });

  function tick() {
    if (!open || !session) return;
    fetch(base + "/api/desk/thread?id=" + encodeURIComponent(session.id) + "&token=" + encodeURIComponent(session.token))
      .then(function (res) {
        if (res.status === 403) {
          localStorage.removeItem(KEY);
          session = null;
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then(function (data) {
        if (!data || !data.thread) return;
        var known = {};
        messages.forEach(function (m) { known[m.id] = true; });
        var added = false;
        (data.thread.messages || []).forEach(function (m) {
          if (m.role === "staff" && !known[m.id]) {
            messages.push(m);
            added = true;
          }
        });
        if (added) render();
      })
      .catch(function () {});
  }

  setInterval(tick, 4000);
  render();
})();
