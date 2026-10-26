const cache = new Map();

function hasChinese(text) {
  return /[\u4e00-\u9fff]/.test(text);
}

export async function translate(text, from, to) {
  const key = `${from}|${to}|${text}`;
  if (cache.has(key)) return cache.get(key);
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error("translate failed");
  const data = await res.json();
  const out = Array.isArray(data?.[0])
    ? data[0].map((part) => part?.[0] || "").join("")
    : "";
  if (!out) throw new Error("empty translation");
  cache.set(key, out);
  return out;
}

export async function toChinese(text) {
  if (!text || hasChinese(text)) return text;
  try {
    return await translate(text, "en", "zh-CN");
  } catch {
    return "";
  }
}

export async function toEnglish(text) {
  if (!text || !hasChinese(text)) return text;
  try {
    const out = await translate(text, "zh-CN", "en");
    return out
      .replace(/exhibition hall/gi, "showroom")
      .replace(/show room/gi, "showroom");
  } catch {
    return text;
  }
}

export { hasChinese };
