// ==========================================================
// Helpers
// ==========================================================
const API_BASE = "https://localhost:7057";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDateTime(dtString) {
  const d = new Date(dtString);
  if (isNaN(d.getTime())) return { date: "-", time: "-" };

  const date = `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;

  let h = d.getHours();
  const m = pad2(d.getMinutes());
  const ampm = h >= 12 ? "م" : "ص";
  h = h % 12;
  h = h ? h : 12;
  const time = `${pad2(h)}:${m} ${ampm}`;

  return { date, time };
}

function statusClass(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("accept") || s.includes("approved") || s.includes("done")) return "accepted";
  if (s.includes("reject") || s.includes("cancel")) return "rejected";
  return "pending";
}

function statusTextAr(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("accept") || s.includes("approved")) return "مقبول";
  if (s.includes("reject")) return "مرفوض";
  if (s.includes("cancel")) return "ملغي";
  if (s.includes("done") || s.includes("complete")) return "مكتمل";
  return "قيد المراجعة";
}

function paymentTextAr(methodId) {
  if (methodId === 1 || methodId === "1") return "فيزا";
  if (methodId === 2 || methodId === "2") return "كاش";
  return methodId ?? "-";
}

function toAbsoluteUrl(url) {
  if (!url) return null;
  const u = String(url).trim();
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return API_BASE + u;
  return u;
}

function normalizeOrdersResponse(raw) {
  // الباك بيرجع: {count, orders:[...]}
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.orders)) return raw.orders;
  return [];
}

// ==========================================================
// Tabs (طلبات الأدوية / الأوردرات)
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".req-tab");
  const sections = document.querySelectorAll(".req-section");

  tabs.forEach((btn) => {
    btn.addEventListener("click", async () => {
      tabs.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const target = btn.dataset.tab;

      sections.forEach((sec) => sec.classList.remove("active"));
      document.getElementById(target)?.classList.add("active");

      if (target === "medicines") await loadMedicineRequests();
      if (target === "orders") await loadOrders();
    });
  });
});

// ==========================================================
// Popup (تفاصيل الصيدليات)  ✅ ديناميك
// ==========================================================
function openPopup() {
  const p = document.getElementById("popup");
  if (!p) return;
  p.style.display = "flex";
  p.classList.add("active");
}

function closePopup() {
  const p = document.getElementById("popup");
  if (!p) return;
  p.classList.remove("active");
  p.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("closePopup")?.addEventListener("click", closePopup);

  document.getElementById("popup")?.addEventListener("click", (e) => {
    if (e.target?.id === "popup") closePopup();
  });
});

// ==========================================================
// ✅ Load Missing Medicine Requests (طلبات الأدوية الناقصة)
// API: medicineRequestsApi.myRequests()
// ==========================================================
async function loadMedicineRequests() {
  const container = document.getElementById("medicines");
  if (!container) return;

  container.innerHTML = `<p style="text-align:center;">جاري تحميل طلبات الأدوية الناقصة...</p>`;

  try {
    if (!window.medicineRequestsApi?.myRequests) {
      container.innerHTML = `<p style="text-align:center;">MedicineRequests API غير متوفر.</p>`;
      return;
    }

    const list = await window.medicineRequestsApi.myRequests();

    if (!list || list.length === 0) {
      container.innerHTML = `<p style="text-align:center;">لا توجد طلبات أدوية ناقصة حتى الآن.</p>`;
      return;
    }

    container.innerHTML = list
      .map((r) => {
        const id = r.idRequest ?? r.IdRequest ?? r.requestId ?? r.RequestId ?? "-";
        const med = r.medicineName ?? r.MedicineName ?? "-";
        const qty = r.quantity ?? r.Quantity ?? "-";
        const status = r.orderStatus ?? r.OrderStatus ?? "P";
        const dt = r.createAt ?? r.CreateAt;
        const { date, time } = formatDateTime(dt);

        return `
          <div class="request-card">
            <h3>
              <i class="fa-solid fa-hashtag" style="color:#00ffcc;"></i>
              <strong> رقم الطلب : </strong> ${id}
            </h3>

            <p><strong>💊 اسم الدواء :</strong> ${med}</p>
            <p><strong>📦 الكمية المطلوبة :</strong> ${qty}</p>

            <p><strong>📅 التاريخ :</strong> ${date}</p>
            <p><strong>⏰ الوقت :</strong> ${time}</p>

            <p>
              <i class="fa-solid fa-clipboard-check"></i>
              <strong>الحالة :</strong>
              <span class="status ${statusClass(status)}">${statusTextAr(status)}</span>
            </p>

            <div class="request-actions">
              <button class="btn view" data-med-req-id="${id}">
                <i class="fa-solid fa-eye"></i> التفاصيل
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    // ✅ زر التفاصيل يجيب الصيدليات الحقيقيين
    container.querySelectorAll("button[data-med-req-id]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-med-req-id");
        await showMedicineResponses(id);
      });
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="text-align:center;">حدث خطأ أثناء تحميل الطلبات.</p>`;
    window.showErrorMessage?.("مش قادر أجيب طلبات الأدوية الناقصة.");
  }
}

// ==========================================================
// ✅ تفاصيل الصيدليات الحقيقي (من API)
// API: medicineRequestsApi.responses(requestId)
// يتوقع الباك يرجع: { responses: [ { pharmacyName, email, phone, address, AvailableQuantity } ] }
// ==========================================================
async function showMedicineResponses(requestId) {
  const body = document.getElementById("popupBody");
  if (!body) {
    console.error("popupBody not found in Requests.html");
    window.showErrorMessage?.("popupBody مش موجود في Requests.html");
    return;
  }

  body.innerHTML = `<p style="text-align:center;">جاري تحميل التفاصيل...</p>`;
  openPopup();

  try {
    if (!window.medicineRequestsApi?.responses) {
      body.innerHTML = `<p style="text-align:center;">Responses API غير متوفر.</p>`;
      return;
    }

    const data = await window.medicineRequestsApi.responses(requestId);
    const responses = Array.isArray(data) ? data : (data?.responses || data?.Responses || []);

    if (!responses || responses.length === 0) {
      body.innerHTML = `<p style="text-align:center;">لا توجد ردود من الصيدليات حتى الآن.</p>`;
      return;
    }

    body.innerHTML = responses
      .map((r, idx) => {
        const name = r.pharmacyName ?? r.PharmacyName ?? r.name ?? r.Name ?? `صيدلية #${idx + 1}`;
        const email = r.email ?? r.Email ?? "-";
        const phone = r.phone ?? r.Phone ?? "-";
        const address = r.address ?? r.Address ?? "-";
        const qty = r.availableQuantity ?? r.AvailableQuantity ?? r.quantity ?? r.Quantity ?? "-";

        return `
          <div style="border:1px solid rgba(255,255,255,.15); padding:12px; border-radius:12px; margin:10px 0;">
            <p><strong>الاسم :</strong> ${name}</p>
            <p><strong>العنوان :</strong> ${address}</p>
            <p><strong>رقم الهاتف :</strong> ${phone}</p>
            <p><strong>البريد الإلكتروني :</strong> ${email}</p>
            <p><strong>الكمية المتاحة لديه :</strong> ${qty}</p>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("RESPONSES ERROR:", err);
    body.innerHTML = `<p style="text-align:center;">حدث خطأ أثناء تحميل التفاصيل.</p>`;
    window.showErrorMessage?.("مش قادر أجيب تفاصيل الصيدليات.");
  }
}

// ==========================================================
// ✅ Orders Popup (تفاصيل الأوردر) - ديناميك
// ==========================================================
function ensureOrderPopupShell() {
  const overlay = document.getElementById("orderPopup");
  if (!overlay) return;

  // ابني الشكل مرة واحدة
  if (!document.getElementById("orderPopupBody")) {
    overlay.innerHTML = `
      <div class="order-popup-content order-popup">
        <h3 class="ditails-title">🧾 تفاصيل الأوردر</h3>
        <div id="orderPopupHeader"></div>
        <div class="order-items-wrapper" id="orderPopupBody"></div>
        <button class="btn close" id="closeOrderPopupBtn">إغلاق</button>
      </div>
    `;

    document.getElementById("closeOrderPopupBtn")?.addEventListener("click", closeOrderPopup);
  }
}

function openOrderPopup(orderId) {
  ensureOrderPopupShell();

  const overlay = document.getElementById("orderPopup");
  const body = document.getElementById("orderPopupBody");
  const header = document.getElementById("orderPopupHeader");
  if (!overlay || !body || !header) return;

  overlay.style.display = "flex";
  overlay.classList.add("active");

  header.innerHTML = "";
  body.innerHTML = `<p style="text-align:center;">جاري تحميل التفاصيل...</p>`;

  loadOrderDetailsIntoPopup(orderId);
}

function closeOrderPopup() {
  const overlay = document.getElementById("orderPopup");
  if (!overlay) return;
  overlay.classList.remove("active");
  overlay.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("orderPopup")?.addEventListener("click", (e) => {
    if (e.target?.id === "orderPopup") closeOrderPopup();
  });
});

async function loadOrderDetailsIntoPopup(orderId) {
  const body = document.getElementById("orderPopupBody");
  const header = document.getElementById("orderPopupHeader");
  if (!body || !header) return;

  try {
    const data = await window.ordersApi.orderDetails(orderId);

    // الباك: { orderId, CreateAtOrder, TotalAmount, IdPaymentMethod, items:[...] }
    const dt = data?.CreateAtOrder;
    const total = data?.TotalAmount ?? "-";
    const pay = data?.IdPaymentMethod ?? "-";
    const { date, time } = formatDateTime(dt);

    header.innerHTML = `
      <div style="margin:10px 0 15px;">
        <p><strong>رقم الأوردر :</strong> ${data?.orderId ?? orderId}</p>
        <p><strong>السعر الكلي :</strong> ${total}</p>
        <p><strong>طريقة الدفع :</strong> ${paymentTextAr(pay)}</p>
        <p><strong>التاريخ :</strong> ${date} - <strong>الوقت :</strong> ${time}</p>
      </div>
    `;

    const items = Array.isArray(data?.items) ? data.items : [];

    if (!items.length) {
      body.innerHTML = `<p style="text-align:center;">لا توجد عناصر في هذا الأوردر.</p>`;
      return;
    }

    body.innerHTML = items
      .map((it) => {
        const name = it.ProductApiName ?? "منتج";
        const qty = it.Quantity ?? 1;
        const price = it.Price ?? "-";
        const img = toAbsoluteUrl(it.ImageUrl);

        return `
          <div class="order-item" style="display:flex; gap:12px; align-items:center; margin:10px 0;">
            <div class="order-img-box" style="width:70px; height:70px; overflow:hidden; border-radius:10px; background:rgba(255,255,255,.08); display:flex; align-items:center; justify-content:center;">
              ${
                img
                  ? `<img src="${img}" alt="${name}" style="width:100%; height:100%; object-fit:cover;"
                       onerror="this.style.display='none'; this.parentElement.innerHTML='لا توجد صورة';">`
                  : `لا توجد صورة`
              }
            </div>

            <div class="order-info">
              <h3 class="med-name" style="margin:0;">${name}</h3>
              <p class="med-qty" style="margin:6px 0 0;">الكمية : ${qty}</p>
              <p class="med-price" style="margin:6px 0 0;">السعر : ${price}</p>
            </div>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    console.error("ORDER DETAILS ERROR:", err);
    body.innerHTML = `<p style="text-align:center;">حصل خطأ أثناء تحميل تفاصيل الأوردر.</p>`;
    window.showErrorMessage?.("مش قادر أجيب تفاصيل الأوردر.");
  }
}

// ==========================================================
// ✅ Load Orders (طلبات الأوردرات)
// API: ordersApi.myOrders() => {count, orders:[...]}
// ==========================================================
async function loadOrders() {
  const container = document.getElementById("orders");
  if (!container) return;

  container.innerHTML = `<p style="text-align:center;">جاري تحميل طلبات الأوردرات...</p>`;

  try {
    if (!window.ordersApi?.myOrders) {
      container.innerHTML = `<p style="text-align:center;">Orders API غير متوفر.</p>`;
      return;
    }

    const raw = await window.ordersApi.myOrders();
    const list = normalizeOrdersResponse(raw);

    if (!list.length) {
      container.innerHTML = `<p style="text-align:center;">لا توجد أوردرات حتى الآن.</p>`;
      return;
    }

    container.innerHTML = list
      .map((o) => {
        const id = o.IdOrder ?? o.idOrder ?? o.orderId ?? "-";
        const total = o.TotalAmount ?? o.totalAmount ?? "-";
        const pay = o.IdPaymentMethod ?? o.idPaymentMethod ?? "-";
        const dt = o.CreateAtOrder ?? o.createAtOrder ?? o.createdAt ?? "-";
        const { date, time } = formatDateTime(dt);

        return `
          <div class="request-order">
            <h3><strong>🧾 رقم الاوردر :</strong> ${id}</h3>

            <p><strong>💲 السعر الكلي :</strong> ${total}</p>

            <p><strong>💵 طريقة الدفع :</strong>
              <span class="status visa">${paymentTextAr(pay)}</span>
            </p>

            <p><strong>📅 التاريخ :</strong> ${date}</p>
            <p><strong>⏰ الوقت :</strong> ${time}</p>

            <p><i class="fa-solid fa-clipboard-check"></i> <strong>الحالة :</strong>
              <span class="status ${statusClass("pending")}">${statusTextAr("pending")}</span>
            </p>

            <div class="request-actions">
              <button class="btn view" data-order-id="${id}">
                <i class="fa-solid fa-eye"></i> التفاصيل
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll("button[data-order-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-order-id");
        openOrderPopup(id);
      });
    });
  } catch (err) {
    console.error("LOAD ORDERS ERROR:", err);
    container.innerHTML = `<p style="text-align:center;">حدث خطأ أثناء تحميل الأوردرات.</p>`;
    window.showErrorMessage?.("مش قادر أجيب الأوردرات.");
  }
}

// ==========================================================
// ✅ أول ما الصفحة تفتح: حمّل طلبات الأدوية الناقصة
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  await loadMedicineRequests();
});

// Expose (لو عندك onclick قديم)
window.openOrderPopup = openOrderPopup;
window.closeOrderPopup = closeOrderPopup;
