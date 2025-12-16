// ==========================================================
// ✅ FINAL FULL FILE (OCR.space + OpenFDA Label+NDC + Arabic ONLY + Single Drug Fix)
// ==========================================================
const OCR_API_KEY = "K84011146488957";
const OPENFDA_LABEL_URL = "https://api.fda.gov/drug/label.json";
const OPENFDA_NDC_URL = "https://api.fda.gov/drug/ndc.json";

const TRANSLATE_TO_AR = true;

const MYMEMORY_SAFE_CHUNK = 420;
const MAX_MEDS_FROM_RX = 8;

// نجيب نتائج أكتر ونختار أفضل Match
const OPENFDA_LIMIT = 10;

// ✅ للصور: اعرض دواء واحد فقط (أفضل نتيجة)
// لو عايزة تعرض كل الأدوية من الصورة خليها false
const IMAGE_SINGLE_MED_MODE = true;

// ==========================================================
// ✅ Helpers
// ==========================================================
function containsArabic(text) {
  return /[\u0600-\u06FF]/.test(String(text || ""));
}

function cleanForOpenFdaQuery(name) {
  return String(name || "")
    .replace(/["]/g, "")
    .replace(/[^\w\s\-+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ==========================================================
// 🌍 Translation (MyMemory) — returns null on failure
// ==========================================================
function isMyMemoryErrorText(t) {
  const s = String(t || "").toLowerCase();
  return (
    s.includes("query length limit exceeded") ||
    s.includes("max allowed query") ||
    s.includes("invalid language pair") ||
    s.includes("too many requests") ||
    s.includes("rate limit") ||
    s.includes("invalid request") ||
    s.includes("limit")
  );
}

async function translateTextOrNull(from, to, text) {
  try {
    const t = String(text || "").trim();
    if (!t || t === "غير متوفر") return t;

    const clipped = t.length > MYMEMORY_SAFE_CHUNK ? t.slice(0, MYMEMORY_SAFE_CHUNK) + "..." : t;

    const url =
      "https://api.mymemory.translated.net/get?q=" +
      encodeURIComponent(clipped) +
      `&langpair=${from}|${to}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data?.responseStatus && data.responseStatus !== 200) return null;

    const translated = data?.responseData?.translatedText;
    if (!translated) return null;
    if (isMyMemoryErrorText(translated)) return null;

    return translated;
  } catch {
    return null;
  }
}

async function translateEnToArOrNull(text) {
  return translateTextOrNull("en", "ar", text);
}
async function translateArToEnOrNull(text) {
  return translateTextOrNull("ar", "en", text);
}

// ==========================================================
// ✅ Arabic fallback (NO ENGLISH OUTPUT EVER)
// ==========================================================
function keywordToArabic(eng) {
  const s = String(eng || "").toLowerCase();

  const map = [
    ["hypertension", "ارتفاع ضغط الدم"],
    ["blood pressure", "ضغط الدم"],
    ["heart failure", "قصور القلب"],
    ["post-myocardial infarction", "بعد الجلطة القلبية"],
    ["myocardial infarction", "جلطة قلبية"],
    ["stroke", "سكتة دماغية"],
    ["headache", "صداع"],
    ["fever", "حمّى"],
    ["cough", "سعال"],
    ["sore throat", "ألم/التهاب الحلق"],
    ["runny nose", "سيلان الأنف"],
    ["nasal congestion", "احتقان الأنف"],
    ["congestion", "احتقان"],
    ["aches", "آلام بالجسم"],
    ["pain", "ألم"],
    ["dizziness", "دوخة/دوار"],
    ["fatigue", "إرهاق"],
    ["diarrhea", "إسهال"],
    ["abdominal pain", "ألم بالبطن"],
    ["hypotension", "هبوط ضغط"],
    ["hyperkalemia", "ارتفاع البوتاسيوم"],
    ["allergy", "حساسية"],
    ["rash", "طفح جلدي"],
    ["blisters", "فقاعات جلدية"],
    ["liver", "الكبد"],
    ["kidney", "الكلى"],
    ["renal", "الكلى/وظائف الكلى"],
    ["pregnancy", "الحمل"],
    ["fetal", "الجنين"],
    ["acetaminophen", "باراسيتامول/أسيتامينوفين"],
    ["diphenhydramine", "ديفينهيدرامين (مسبب للنعاس)"],
    ["valsartan", "فالسارتان"],
    ["nicotine", "نيكوتين"],
    ["warfarin", "وارفارين (مميع دم)"],
    ["maoi", "مثبطات MAO"],
    ["alcohol", "كحول"],
    ["glaucoma", "جلوكوما"],
    ["bronchitis", "التهاب شعب مزمن"],
    ["emphysema", "انتفاخ رئة"],
    ["prostate", "تضخم البروستاتا"],
    ["driving", "القيادة/تشغيل الآلات"],
    ["nsaid", "مضادات الالتهاب غير الستيرويدية (NSAIDs)"],
    ["ibuprofen", "إيبوبروفين"],
    ["naproxen", "نابروكسين"],
    ["potassium", "بوتاسيوم"],
    ["diuretics", "مدرات بول"],
    ["salt substitutes", "بدائل الملح"],
    ["electrolytes", "الأملاح/الإلكتروليتات"],
    ["creatinine", "كرياتينين"]
  ];

  const hits = [];
  for (const [k, ar] of map) if (s.includes(k)) hits.push(ar);
  return [...new Set(hits)];
}

function fallbackArabicSummary(section, englishText) {
  const hits = keywordToArabic(englishText);

  if (section === "general") {
    return hits.length ? `ملخص (حسب النص): ${hits.join("، ")}.` : "غير متاح بالعربي حاليًا.";
  }

  if (section === "dosage") {
    const doseMatch = englishText.match(/take\s+(\d+)\s+(caplets|tablets|capsules|softgels)/i);
    const mgMatch = englishText.match(/(\d+)\s*mg/i);
    const onceDaily = /once\s+daily/i.test(englishText);
    const twiceDaily = /twice\s+daily/i.test(englishText);
    const bedtime = /bedtime/i.test(englishText);

    let line = "الجرعة: اتبع تعليمات الطبيب/العبوة ولا تتجاوز الجرعة الموصى بها.";
    if (doseMatch) line = `الجرعة المذكورة: ${doseMatch[1]} قرص/كبسولة.`;
    else if (mgMatch) line = `الجرعة المذكورة: ${mgMatch[1]} مجم (تقريبًا حسب النص).`;

    if (onceDaily) line += " مرة يوميًا.";
    if (twiceDaily) line += " مرتين يوميًا.";
    if (bedtime) line += " قبل النوم.";
    return line;
  }

  if (section === "uses") {
    return hits.length ? `الاستخدامات المحتملة (حسب النص): ${hits.join("، ")}.` : "الاستخدامات: حسب تعليمات الطبيب/العبوة.";
  }

  if (section === "adverse") {
    return hits.length ? `الآثار الجانبية المحتملة (حسب النص): ${hits.join("، ")}.` : "الآثار الجانبية: استشر الطبيب/الصيدلي عند ظهور أعراض غير معتادة.";
  }

  if (section === "warnings") {
    const lines = [];
    if (/pregnan|fetal/i.test(englishText)) lines.push("تحذير مهم: قد يسبب ضررًا للجنين أثناء الحمل — استشيري الطبيب فورًا.");
    if (/renal|kidney/i.test(englishText)) lines.push("تحذير يتعلق بوظائف الكلى — قد يلزم متابعة الطبيب.");
    if (/liver/i.test(englishText)) lines.push("تحذير يتعلق بالكبد — راجعي الطبيب عند وجود مرض كبدي.");
    if (/drowsiness/i.test(englishText)) lines.push("قد يسبب نعاسًا — تجنبي القيادة/الآلات.");
    if (!lines.length && hits.length) lines.push(`تنبيهات عامة (حسب النص): ${hits.join("، ")}.`);
    if (!lines.length) lines.push("تحذيرات: اتبع تعليمات الطبيب/العبوة.");
    return lines.join(" ");
  }

  if (section === "interactions") {
    const lines = [];
    if (/nsaid/i.test(englishText) || /ibuprofen|naproxen/i.test(englishText)) {
      lines.push("قد يتداخل مع مسكنات/NSAIDs وقد يؤثر على الكلى أو يقلل تأثير الدواء — استشيري الطبيب.");
    }
    if (/potassium|salt substitutes/i.test(englishText)) {
      lines.push("الحذر مع مكملات البوتاسيوم/بدائل الملح (قد ترفع البوتاسيوم) — يلزم متابعة.");
    }
    if (/warfarin/i.test(englishText)) lines.push("قد يتداخل مع الوارفارين — راجعي الطبيب/الصيدلي.");
    if (!lines.length && hits.length) lines.push(`تداخلات محتملة (حسب النص): ${hits.join("، ")}.`);
    if (!lines.length) lines.push("التفاعلات الدوائية: استشيري الصيدلي قبل الجمع مع أدوية أخرى.");
    return lines.join(" ");
  }

  return "غير متاح بالعربي حاليًا.";
}

async function translateLongTextEnToAr(text, sectionForFallback = "general") {
  const t = String(text || "").trim();
  if (!t || t === "غير متوفر") return t;

  const parts = t
    .replace(/\r/g, "\n")
    .split(/(?:\n+|(?<=\.)\s+|;\s+)/g)
    .map(p => p.trim())
    .filter(Boolean)
    .slice(0, 18);

  const out = [];
  for (const part of parts) {
    const safePart = part.length > MYMEMORY_SAFE_CHUNK ? part.slice(0, MYMEMORY_SAFE_CHUNK) + "..." : part;
    const tr = await translateEnToArOrNull(safePart);
    out.push(tr && containsArabic(tr) ? tr : fallbackArabicSummary(sectionForFallback, safePart));
  }
  return out.join(" ");
}

// ==========================================================
// ✅ Similarity (avoid wrong meds + dedupe candidates)
// ==========================================================
function normalizeName(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(s) {
  return new Set(normalizeName(s).split(" ").filter(w => w.length >= 3));
}

function jaccard(a, b) {
  const A = tokenSet(a);
  const B = tokenSet(b);
  if (!A.size || !B.size) return 0;

  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;

  const union = A.size + B.size - inter;
  return union ? inter / union : 0;
}

// ✅ دمج المرشحات المتشابهة جدًا (ده اللي بيمنع "دواء واحد => 2")
function dedupeCandidates(cands) {
  const out = [];
  for (const c of cands) {
    if (!out.some(x => jaccard(x, c) >= 0.70)) out.push(c);
  }
  return out;
}

function bestMatchByScore(candidate, results, brandGetter, genericGetter) {
  let best = null;
  let bestScore = 0;

  for (const r of results || []) {
    const brand = brandGetter(r) || "";
    const generic = genericGetter(r) || "";
    const score = Math.max(jaccard(candidate, brand), jaccard(candidate, generic));
    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  }
  return { best, bestScore };
}

// ==========================================================
// ✅ Text extraction helpers
// ==========================================================
function takeFirstSentences(t, n = 12) {
  const s = String(t || "").replace(/\r/g, "\n").trim();
  if (!s) return "غير متوفر";

  const parts = s
    .split(/(?:\n+|(?<=\.)\s+|;\s+)/g)
    .map(x => x.trim())
    .filter(Boolean);

  return parts.slice(0, n).join(" ");
}

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
    "interaction", "interact", "contraind", "avoid",
    "warfarin", "maoi", "alcohol", "sedatives", "tranquilizers",
    "nsaid", "ibuprofen", "naproxen",
    "potassium", "salt substitutes", "creatinine", "renal"
  ];

  const picked = sentences.filter(s => {
    const low = s.toLowerCase();
    return keys.some(k => low.includes(k));
  });

  if (!picked.length) return sentences.slice(0, 6).join(" ");
  return picked.slice(0, 10).join(" ");
}

// ==========================================================
// 📷 OCR.space
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
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append("OCREngine", "2");
  formData.append("file", file);

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (data?.IsErroredOnProcessing) throw new Error(data?.ErrorMessage?.[0] || "OCR failed");

  const extractedText = (data?.ParsedResults?.[0]?.ParsedText || "").replace(/\r/g, "\n").trim();
  if (!extractedText) throw new Error("لم يتم العثور على نص في الصورة");
  return extractedText;
}

// ==========================================================
// 🧾 Candidate extraction (reduce marketing/symptoms)
// ==========================================================
function extractDrugNameCandidates(ocrText) {
  const raw = String(ocrText || "").replace(/\r/g, "\n");

  const bad = new Set([
    "cold","flu","relief","non","drowsy","non-drowsy","daytime","nighttime",
    "effective","from","blocked","runny","nose","headache","body","ache",
    "fever","cough","sore","throat","congestion","sinus","pain","pressure",
    "children","childrens","child","adult","directions","warnings","uses",
    "take","use","daily","morning","night","before","after","meal","hours",
    "tablet","tablets","tab","tabs","cap","caps","capsule","capsules",
    "caplets","syrup","cream","ointment","drop","drops","spray","amp","amps",
    "mg","g","mcg","ml"
  ]);

  const lines = raw.split("\n").map(s => s.trim()).filter(Boolean);
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
    if (!/[a-zA-Z]/.test(line)) continue;

    const words = line.split(" ").filter(Boolean);
    if (words.length > 6) continue;

    const filtered = words
      .filter(w => w.length >= 3)
      .filter(w => !bad.has(w.toLowerCase()));

    if (!filtered.length) continue;

    const name = filtered.slice(0, 3).join(" ").trim();
    if (name.length < 4 || name.length > 45) continue;

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
// 🔎 OpenFDA: Label + NDC fallback
// ==========================================================
async function labelSearchList(query) {
  const url = `${OPENFDA_LABEL_URL}?search=${encodeURIComponent(query)}&limit=${OPENFDA_LIMIT}`;
  const resp = await fetch(url);
  const data = await resp.json();
  return data?.results || [];
}

async function ndcSearchList(query) {
  const url = `${OPENFDA_NDC_URL}?search=${encodeURIComponent(query)}&limit=${OPENFDA_LIMIT}`;
  const resp = await fetch(url);
  const data = await resp.json();
  return data?.results || [];
}

async function searchOpenFdaBest(name) {
  const safe = cleanForOpenFdaQuery(name);
  if (!safe) return null;

  const labelQueries = [
    `openfda.brand_name:"${safe}"`,
    `openfda.generic_name:"${safe}"`,
    `openfda.brand_name:${safe}*`,
    `openfda.generic_name:${safe}*`,
    `${safe}`
  ];

  for (const q of labelQueries) {
    const list = await labelSearchList(q);
    if (!list.length) continue;

    const { best, bestScore } = bestMatchByScore(
      safe,
      list,
      r => r?.openfda?.brand_name?.[0],
      r => r?.openfda?.generic_name?.[0]
    );

    const isExact = q.includes(':"') && q.includes('"');
    const threshold = isExact ? 0.30 : 0.48;

    if (best && bestScore >= threshold) return best;
  }

  const ndcQueries = [
    `brand_name:"${safe}"`,
    `generic_name:"${safe}"`,
    `brand_name:${safe}*`,
    `generic_name:${safe}*`,
    `${safe}`
  ];

  for (const q of ndcQueries) {
    const list = await ndcSearchList(q);
    if (!list.length) continue;

    const { best, bestScore } = bestMatchByScore(
      safe,
      list,
      r => r?.brand_name,
      r => r?.generic_name
    );

    const isExact = q.includes(':"') && q.includes('"');
    const threshold = isExact ? 0.30 : 0.48;

    if (!best || bestScore < threshold) continue;

    const ndcBrand = best?.brand_name || "";
    const ndcGeneric = best?.generic_name || "";
    const retryNames = [ndcBrand, ndcGeneric].map(cleanForOpenFdaQuery).filter(Boolean);

    for (const rn of retryNames) {
      const list2 = await labelSearchList(`openfda.brand_name:"${rn}"`);
      if (!list2.length) continue;

      const { best: best2, bestScore: score2 } = bestMatchByScore(
        rn,
        list2,
        r => r?.openfda?.brand_name?.[0],
        r => r?.openfda?.generic_name?.[0]
      );

      if (best2 && score2 >= 0.30) return best2;
    }

    return null;
  }

  return null;
}

async function filterCandidatesByOpenFda(candidates) {
  const kept = [];
  for (const c of candidates) {
    const r = await searchOpenFdaBest(c);
    if (r) kept.push({ name: c, result: r });
  }
  return kept;
}

// ==========================================================
// 💊 Build medication card (Arabic ONLY)
// ==========================================================
async function formatMedicationInfoFromResult(queryName, result) {
  const brand = result?.openfda?.brand_name?.[0] || queryName;
  const generic = result?.openfda?.generic_name?.[0] || "غير متوفر";

  const usesEN = takeFirstSentences(result?.indications_and_usage?.[0] || "غير متوفر", 12);
  const dosageEN = takeFirstSentences(result?.dosage_and_administration?.[0] || "غير متوفر", 12);
  const adverseEN = takeFirstSentences(result?.adverse_reactions?.[0] || "غير متوفر", 12);
  const warningsEN = takeFirstSentences(result?.warnings?.[0] || result?.boxed_warning?.[0] || "غير متوفر", 12);
  const interactionsEN = takeFirstSentences(pickInteractionText(result) || "غير متوفر", 12);

  const uses = await translateLongTextEnToAr(usesEN, "uses");
  const dosage = await translateLongTextEnToAr(dosageEN, "dosage");
  const adverse = await translateLongTextEnToAr(adverseEN, "adverse");
  const warnings = await translateLongTextEnToAr(warningsEN, "warnings");
  const interactions = await translateLongTextEnToAr(interactionsEN, "interactions");

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
}

// ==========================================================
// 💊 Typing input (manual name)
// ==========================================================
async function getMedicationInfo(query) {
  try {
    let name = String(query || "").trim();
    if (!name) return "❌ اسم الدواء غير صالح.";

    if (containsArabic(name)) {
      const en = await translateArToEnOrNull(name);
      name = en || name;
    }

    const result = await searchOpenFdaBest(name);
    if (!result) {
      return `❌ لم أقدر أحدد الدواء بشكل مؤكد من قواعد OpenFDA.
جرّبي كتابة الاسم بالإنجليزي بدقة أو ابعتي صورة أوضح.
(الاسم: ${name})`;
    }

    return await formatMedicationInfoFromResult(name, result);
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
  const text = input?.value?.trim();
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

    // استخراج + Dedup
    const candidatesRaw = extractDrugNameCandidates(fullText);
    const candidates = dedupeCandidates(candidatesRaw);

    if (!candidates.length) {
      typing.remove();
      await addMessageToChat(
        "❌ ماقدرتش أطلع اسم دواء واضح من الصورة. جرّبي صورة أقرب لاسم الدواء أو اكتبيه يدويًا.",
        "bot"
      );
      return;
    }

    const validAll = await filterCandidatesByOpenFda(candidates);

    if (!validAll.length) {
      typing.remove();
      await addMessageToChat(
        "❌ اتعرفت على أسماء محتملة من الصورة، لكن مش موجودة/مش مؤكدة داخل OpenFDA.\nجرّبي تكتبي الاسم بالإنجليزي أو ابعتي صورة أوضح.",
        "bot"
      );
      return;
    }

    // ✅ Single drug mode for images
    const valid = IMAGE_SINGLE_MED_MODE ? [validAll[0]] : validAll;

    const names = valid.map(x => x.result?.openfda?.brand_name?.[0] || x.name);

    let combined = IMAGE_SINGLE_MED_MODE
      ? `🧾 تم التعرف على دواء واحد:\n- ${names[0]}\n\n`
      : `🧾 تم التعرف على ${valid.length} دواء:\n- ${names.join("\n- ")}\n\n`;

    for (const item of valid) {
      const info = await formatMedicationInfoFromResult(item.name, item.result);
      combined += `\n\n${info}\n`;
    }

    typing.remove();
    await addMessageToChat(combined.trim(), "bot");
  } catch {
    typing.remove();
    await addMessageToChat("❌ حصل خطأ أثناء قراءة الصورة. جرّبي صورة أوضح.", "bot");
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
