(function () {
  /* ==========================================================
     Toast / Success / Error Messages
  ========================================================== */

  function clearToasts() {
    document.querySelectorAll(".se7ty-toast").forEach((t) => t.remove());
  }

  function createToastStyles() {
    if (document.getElementById("se7ty-toast-style")) return;

    const style = document.createElement("style");
    style.id = "se7ty-toast-style";
    style.innerHTML = `
      .se7ty-toast{
        position:fixed;
        top:30px;
        left:50%;
        transform:translateX(-50%) translateY(-10px);
        opacity:0;
        padding:14px 28px;
        border-radius:14px;
        font-weight:600;
        font-size:15px;
        display:flex;
        align-items:center;
        gap:10px;
        z-index:9999;
        transition:all .35s ease;
        backdrop-filter: blur(6px);
      }
      .se7ty-toast.show{
        opacity:1;
        transform:translateX(-50%) translateY(50px);
      }
      .se7ty-toast.success{
        background:rgba(16, 185, 129, 0.9);
        color:#fff;
        box-shadow:0 8px 25px rgba(0,255,200,.45);
      }
      .se7ty-toast.error{
        background:rgba(220,60,60,.95);
        color:#fff;
        box-shadow:0 8px 25px rgba(255,80,80,.45);
      }
      .se7ty-toast .icon{
        font-size:18px;
      }
    `;
    document.head.appendChild(style);
  }

  window.showToast = function (message, type = "success", ms = 1500) {
    createToastStyles();
    clearToasts();

    const toast = document.createElement("div");
    toast.className = `se7ty-toast ${type}`;
    toast.innerHTML = `
      <span class="icon">${type === "success" ? "✓" : "✖"}</span>
      <span>${message}</span>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, ms);
  };

  /* ==========================================================
     (اختياري) Aliases لو حابب
  ========================================================== */
  window.showSuccessMessage = (msg, ms = 1500) =>
    window.showToast(msg, "success", ms);

  window.showErrorMessage = (msg, ms = 1800) =>
    window.showToast(msg, "error", ms);

})();


// عداد المفضلة في كل الصفح

document.addEventListener("DOMContentLoaded", () => {
  // ✅ تحديث عداد الكارت (لو موجود)
  window.refreshCartBadge?.();

  // ✅ تحديث عداد المفضلة (لو موجود)
  window.refreshFavBadge?.();
});




document.addEventListener("DOMContentLoaded", () => {
  window.refreshNotifBadge?.();
});
