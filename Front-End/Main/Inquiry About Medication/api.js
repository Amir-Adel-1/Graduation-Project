// ==========================================================
// ✅ FREE CONFIG (OCR.space + OpenFDA + Arabic Translation)
// ==========================================================
const OCR_API_KEY = "K84011146488957"; // OCR.space key
const OPENFDA_LABEL_URL = "https://api.fda.gov/drug/label.json";
const TRANSLATE_TO_AR = true;

// حد آمن للـ query عشان ما نعديش 500 char بعد الـ encoding
const MYMEMORY_SAFE_CHUNK = 420;

// أقصى عدد أدوية نطلعهم من الروشتة (عشان مايبقاش بطئ)
const MAX_MEDS_FROM_RX = 8;

// ==========================================================
// 🌍 Helpers
// ==========================================================
function isMyMemoryErrorText(t) {
  const s = String(t || "").toLowerCase();
  return (
    s.includes("query length limit exceeded") ||
    s.includes("max allowed query") ||
    s.includes("invalid language pair") ||
    s.includes("too many requests") ||
    s.includes("rate limit") ||
    s.includes("invalid request")
  );
}

function containsArabic(text) {
  return /[\u0600-\u06FF]/.test(String(text || ""));
}

function cleanForOpenFdaQuery(name) {
  // إزالة علامات ممكن تكسر الـ query + تقليل المسافات
  return String(name || "")
    .replace(/["]/g, "")
    .replace(/[^\w\s\-+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ناخد أول N جملة لتقليل الحجم + تحسين الترجمة
function takeFirstSentences(t, n = 6) {
  const s = String(t || "").replace(/\r/g, "\n").trim();
  if (!s) return s;

  const parts = s
    .split(/(?:\n+|(?<=\.)\s+|;\s+)/g)
    .map(x => x.trim())
    .filter(Boolean);

  return parts.slice(0, n).join(" ");
}

// ==========================================================
// 🌍 Translate (MyMemory) - SAFE
// ==========================================================
async function translateEnToAr(text) {
  try {
    const t = String(text || "").trim();
    if (!t || t === "غير متوفر") return t;

    const clipped =
      t.length > MYMEMORY_SAFE_CHUNK ? t.slice(0, MYMEMORY_SAFE_CHUNK) + "..." : t;

    const url =
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(clipped) +
      "&langpair=en|ar";

    const res = await fetch(url);
    const data = await res.json();

    if (data?.responseStatus && data.responseStatus !== 200) {
      return `⚠️ (تعذّرت الترجمة) ${t}`;
    }

    const translated = data?.responseData?.translatedText;
    if (!translated) return `⚠️ (تعذّرت الترجمة) ${t}`;

    if (isMyMemoryErrorText(translated)) return `⚠️ (تعذّرت الترجمة) ${t}`;
    return translated;
  } catch {
    return `⚠️ (تعذّرت الترجمة) ${String(text || "")}`;
  }
}

// ترجمة نص طويل EN→AR بتقطيع آمن
async function translateLongTextEnToAr(text) {
  const t = String(text || "").trim();
  if (!t || t === "غير متوفر") return t;

  const parts = t
    .replace(/\r/g, "\n")
    .split(/(?:\n+|(?<=\.)\s+|;\s+)/g)
    .map(p => p.trim())
    .filter(Boolean);

  const translatedParts = [];
  for (const part of parts) {
    const safePart =
      part.length > MYMEMORY_SAFE_CHUNK ? part.slice(0, MYMEMORY_SAFE_CHUNK) + "..." : part;

    const tr = await translateEnToAr(safePart);
    translatedParts.push(tr);
  }
  return translatedParts.join(" ");
}

// (اختياري) ترجمة AR→EN للاسم فقط لو المستخدم كتب بالعربي
async function translateArToEn(text) {
  try {
    const t = String(text || "").trim();
    if (!t) return t;

    const clipped = t.length > 120 ? t.slice(0, 120) : t;

    const url =
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(clipped) +
      "&langpair=ar|en";

    const res = await fetch(url);
    const data = await res.json();

    if (data?.responseStatus && data.responseStatus !== 200) return t;

    const translated = data?.responseData?.translatedText;
    if (!translated) return t;

    if (isMyMemoryErrorText(translated)) return t;
    return translated;
  } catch {
    return text;
  }
}

// ==========================================================
// ✅ Better Interaction Extraction (fallback if missing)
// ==========================================================
function pickInteractionText(result) {
  const direct = result?.drug_interactions?.[0];
  if (direct && String(direct).trim()) return direct;

  const fallback =
    result?.warnings?.[0] ||
    result?.precautions?.[0] ||
    result?.clinical_pharmacology?.[0] ||
    "";

  if (!fallback) return "";

  const sentences = String(fallback)
    .replace(/\r/g, "\n")
    .split(/(?:\n+|(?<=\.)\s+)/g)
    .map(s => s.trim())
    .filter(Boolean);

  const keys = [
    "interact", "interaction", "contraind", "avoid",
    "cyp", "inhibitor", "inducer", "qt", "serotonin",
    "warfarin", "rifamp", "azole", "grapefruit",
    "maoi", "ssri", "snri", "opioid", "alcohol"
  ];

  const picked = sentences.filter(s => {
    const low = s.toLowerCase();
    return keys.some(k => low.includes(k));
  });

  if (!picked.length) return sentences.slice(0, 4).join(" ");
  return picked.slice(0, 8).join(" ");
}

// ==========================================================
// 📷 OCR.space – Extract FULL text from image (for prescriptions)
// ==========================================================
async function extractFullTextFromImage(fileOrBase64) {
  let file = fileOrBase64;

  if (typeof fileOrBase64 === "string" && fileOrBase64.startsWith("data:")) {
    const res = await fetch(fileOrBase64);
    const blob = await res.blob();
    file = new File([blob], "image.jpg", { type: blob.type || "image/jpeg" });
  }

  const formData = new FormData();
  formData.append("apikey", OCR_API_KEY);

  // لو روشتك أحيانًا عربي، تقدري تغيّريها لـ "ara" أو تعملي switch من UI
  formData.append("language", "eng");

  formData.append("isOverlayRequired", "false");
  formData.append("OCREngine", "2");
  formData.append("file", file);

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (data?.IsErroredOnProcessing) {
    throw new Error(data?.ErrorMessage?.[0] || "OCR failed");
  }

  let extractedText = data?.ParsedResults?.[0]?.ParsedText || "";
  extractedText = extractedText.replace(/\r/g, "\n").trim();

  if (!extractedText) throw new Error("لم يتم العثور على نص في الصورة");
  return extractedText;
}

// ==========================================================
// 🧾 Extract drug list from OCR text (روشتة)
// ==========================================================
function extractDrugNamesFromPrescription(ocrText) {
  const raw = String(ocrText || "").replace(/\r/g, "\n");

  const stop = new Set([
    "tab", "tabs", "tablet", "tablets", "cap", "caps", "capsule", "capsules",
    "syrup", "cream", "ointment", "drop", "drops", "spray", "amp", "amps",
    "once", "twice", "daily", "bid", "tid", "qid", "prn", "before", "after",
    "meal", "meals", "morning", "night", "noon", "mg", "g", "mcg", "ml",
    "take", "use", "x", "for", "days", "day"
  ]);

  const lines = raw
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);

  const candidates = [];

  for (let line of lines) {
    line = line
      .replace(/\b\d+\s*(mg|g|mcg|ml)\b/gi, " ")
      .replace(/\b\d+\/\d+\b/g, " ")
      .replace(/\b\d+\b/g, " ")
      .replace(/[^\w\s\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!line) continue;

    const hasLatin = /[a-zA-Z]/.test(line);
    if (!hasLatin) continue;

    const words = line.split(" ").filter(Boolean);

    const filtered = words
      .map(w => w.trim())
      .filter(w => w.length >= 3)
      .filter(w => !stop.has(w.toLowerCase()));

    if (!filtered.length) continue;

    const name = filtered.slice(0, 3).join(" ").trim();

    if (name.length < 3 || name.length > 40) continue;

    candidates.push(name);
  }

  const unique = [];
  const seen = new Set();
  for (const c of candidates) {
    const key = c.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(c);
    }
  }

  return unique.slice(0, MAX_MEDS_FROM_RX);
}

// ==========================================================
// 💊 OpenFDA – Medication Info (Arabic) — one drug
// ==========================================================
async function getMedicationInfo(query) {
  try {
    let name = String(query || "").trim();
    if (!name) return "❌ اسم الدواء غير صالح.";

    // لو الاسم عربي → نحاول نحوله لإنجليزي (عشان OpenFDA)
    if (containsArabic(name)) {
      const en = await translateArToEn(name);
      name = en || name;
    }

    const safe = cleanForOpenFdaQuery(name);
    if (!safe) return "❌ اسم الدواء غير صالح.";

    // ✅ بحث أقوى (Exact + Wildcard + Full-text fallback)
    const searches = [
      `openfda.brand_name:"${safe}"`,
      `openfda.generic_name:"${safe}"`,
      `openfda.brand_name:${safe}*`,
      `openfda.generic_name:${safe}*`,
      `${safe}`
    ];

    let result = null;

    for (const s of searches) {
      const url = `${OPENFDA_LABEL_URL}?search=${encodeURIComponent(s)}&limit=1`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data?.results?.length) {
        result = data.results[0];
        break;
      }
    }

    if (!result) {
      return `❌ لم يتم العثور على هذا الدواء في OpenFDA.
جرّب اسم تاني/كتابة أدق بالإنجليزي.
(الاسم: ${safe})`;
    }

    const brand = result?.openfda?.brand_name?.[0] || safe;
    const generic = result?.openfda?.generic_name?.[0] || "غير متوفر";

    // ✅ خدي أول كام جملة لتقليل الضخامة + تحسين الترجمة
    let uses = takeFirstSentences(result?.indications_and_usage?.[0] || "غير متوفر", 6);
    let dosage = takeFirstSentences(result?.dosage_and_administration?.[0] || "غير متوفر", 6);
    let adverse = takeFirstSentences(result?.adverse_reactions?.[0] || "غير متوفر", 6);
    let warnings = takeFirstSentences(
      result?.warnings?.[0] || result?.boxed_warning?.[0] || "غير متوفر",
      6
    );
    let interactions = takeFirstSentences(pickInteractionText(result) || "غير متوفر", 6);

    if (TRANSLATE_TO_AR) {
      uses = await translateLongTextEnToAr(uses);
      dosage = await translateLongTextEnToAr(dosage);
      adverse = await translateLongTextEnToAr(adverse);
      warnings = await translateLongTextEnToAr(warnings);
      interactions = await translateLongTextEnToAr(interactions);
    }

    const footer = "تنبيه: المعلومات هنا للتوعية ولا تُغني عن استشارة الطبيب أو الصيدلي.";

    return `
==============================
💊 ${brand}
==============================
الاسم العلمي: ${generic}

الاستخدامات:
${uses}

الجرعة:
${dosage}

الآثار الجانبية:
${adverse}

التحذيرات:
${warnings}

التفاعلات الدوائية:
${interactions}

${footer}
`.trim();
  } catch {
    return "❌ حدث خطأ أثناء جلب معلومات الدواء.";
  }
}

// ==========================================================
// 💬 Chat UI + Typewriter
// ==========================================================
function parseMarkdown(text) {
  return String(text || "").replace(/\n/g, "<br>");
}

function typeWriter(element, text, speed = 8) {
  return new Promise((resolve) => {
    const parsedText = parseMarkdown(text);
    let i = 0;
    element.innerHTML = "";

    function type() {
      if (i < parsedText.length) {
        element.innerHTML = parsedText.substring(0, i + 1);
        i++;
        const chatBody = document.getElementById("drugChatBody");
        if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
        setTimeout(type, speed);
      } else resolve();
    }
    type();
  });
}

async function addMessageToChat(text, sender = "bot") {
  const chatBody = document.getElementById("drugChatBody");
  if (!chatBody) return;

  const div = document.createElement("div");
  div.className = `message ${sender}`;
  const p = document.createElement("p");
  div.appendChild(p);
  chatBody.appendChild(div);

  if (sender === "bot") {
    await typeWriter(p, text);
  } else {
    p.innerHTML = String(text).includes("<img") ? text : text;
  }

  chatBody.scrollTop = chatBody.scrollHeight;
}

// 🔵 Typing Indicator (3 dots – زي ما كانت)
function showTypingIndicator() {
  const chatBody = document.getElementById("drugChatBody");

  const indicator = document.createElement("div");
  indicator.className = "message bot typing-indicator";
  indicator.innerHTML = `
    <div class="typing">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  chatBody.appendChild(indicator);
  chatBody.scrollTop = chatBody.scrollHeight;
  return indicator;
}

// ==========================================================
// 🎯 Handlers
// ==========================================================
async function handleSendMessage() {
  const input = document.getElementById("drugInput");
  const text = input.value.trim();
  if (!text) return;

  await addMessageToChat(text, "user");
  input.value = "";

  const typing = showTypingIndicator();
  const response = await getMedicationInfo(text);
  typing.remove();
  await addMessageToChat(response, "bot");
}

async function handleFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const imgURL = URL.createObjectURL(file);
  await addMessageToChat(
    `<img src="${imgURL}" style="max-width:200px;border-radius:10px;margin:10px 0;display:block;">`,
    "user"
  );

  const typing = showTypingIndicator();

  try {
    const fullText = await extractFullTextFromImage(file);
    const meds = extractDrugNamesFromPrescription(fullText);

    if (!meds.length) {
      typing.remove();
      await addMessageToChat(
        "❌ لم أستطع استخراج أسماء أدوية من الروشتة.\nجرّب صورة أوضح أو تكون الأسماء بالإنجليزي.",
        "bot"
      );
      return;
    }

    let combined = `🧾 تم التعرف على ${meds.length} دواء من الروشتة:\n- ${meds.join("\n- ")}\n\n`;

    for (let i = 0; i < meds.length; i++) {
      const medName = meds[i];
      const info = await getMedicationInfo(medName);
      combined += `\n\n${info}\n`;
    }

    typing.remove();
    await addMessageToChat(combined.trim(), "bot");
  } catch (err) {
    typing.remove();
    await addMessageToChat("❌ حصل خطأ أثناء قراءة الروشتة. جرّب صورة أوضح.", "bot");
  } finally {
    const fi = document.getElementById("drugFileInput");
    if (fi) fi.value = "";
  }
}

// ==========================================================
// 🚀 Init
// ==========================================================
document.getElementById("drugSendBtn")?.addEventListener("click", handleSendMessage);
document.getElementById("drugInput")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSendMessage();
});
document.getElementById("attachDrugBtn")?.addEventListener("click", () =>
  document.getElementById("drugFileInput")?.click()
);
document.getElementById("drugFileInput")?.addEventListener("change", handleFileChange);
