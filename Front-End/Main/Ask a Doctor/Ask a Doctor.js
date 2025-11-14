document.addEventListener("DOMContentLoaded", () => {

  // helper
  const $id = (s) => document.getElementById(s);
  const $q = (s) => document.querySelector(s);
  const $qa = (s) => document.querySelectorAll(s);

  // =========================
  // NavBar / Scroll behavior
  // =========================
  let cart_clr = $id("cart_clr");
  let fav_clr = $id("fav_clr");
  const navbar = $id("navbar");
  const scrollToTopBtn = $id("scrollToTopBtn");
  let lastScrollTop = 0;

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

      if (navbar) {
        if (currentScroll > lastScrollTop && currentScroll > 100) navbar.classList.add("hidden");
        else navbar.classList.remove("hidden");
      }

      if (navbar) {
        if (currentScroll > 50) {
          navbar.classList.add("scrolled");
          if (cart_clr) cart_clr.style.color = "white";
          if (fav_clr) fav_clr.style.color = "white";
          $qa(".a").forEach(el => el.style.color = "white");
        } else {
          navbar.classList.remove("scrolled");
          if (cart_clr) cart_clr.style.color = "white";
          if (fav_clr) fav_clr.style.color = "white";
        }
      }

      if (scrollToTopBtn) {
        if (window.scrollY > 200) scrollToTopBtn.style.display = "block";
        else scrollToTopBtn.style.display = "none";
      }

      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });
  }

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // =========================
  // User Menu
  // =========================
  const userInfo = $q(".user-info");
  const userMenu = $q(".user-menu");

  if (userInfo && userMenu) {
    userInfo.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenu.style.display = userMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", () => {
      userMenu.style.display = "none";
    });
  }

  // =========================
  // Popup
  // =========================
  const popup = $id("popup");
  const closePopup = $id("closePopup");

  if (typeof openPopup === "undefined") {
    // define only if not defined elsewhere
    window.openPopup = function () {
      if (popup) popup.classList.add("active");
    };
  }

  if (closePopup && popup) {
    closePopup.addEventListener("click", () => popup.classList.remove("active"));
    popup.addEventListener("click", (e) => {
      if (e.target.id === "popup") popup.classList.remove("active");
    });
  }

  // =========================
  // Chat Bot System
  // =========================
  const sendBtn = $id("sendBtn");
  const userInput = $id("userInput");
  const chatBody = $id("chatBody");
  const attachBtn = $id("attachBtn");
  const fileInput = $id("fileInput");

  const menuBtn = $id("menuBtn");
  const menuOptions = $id("menuOptions");
  const newChatBtn = $id("newChat");
  const chatListContainer = $id("chatList");
  const clearBtn = $id("clearChats");

  let allChats = (localStorage && localStorage.getItem("chatHistory")) ? JSON.parse(localStorage.getItem("chatHistory")) : [];
  let currentChat = [];

  const safeAudio = (src) => {
    try { return new Audio(src); } catch (e) { return null; }
  };

  const sendSound = safeAudio("https://cdn.pixabay.com/audio/2022/03/15/audio_7a5f3a3e35.mp3");
  const receiveSound = safeAudio("https://cdn.pixabay.com/audio/2022/03/15/audio_69f16db3b2.mp3");
  const deleteSound = safeAudio("https://cdn.pixabay.com/audio/2022/03/15/audio_5b3bb1b37b.mp3");

  function addMessage(text, sender = "bot") {
    if (!chatBody) return;
    const message = document.createElement("div");
    message.classList.add("message", sender);
    message.innerHTML = `<p>${text}</p>`;
    chatBody.appendChild(message);
    chatBody.scrollTop = chatBody.scrollHeight;
    currentChat.push({ sender, text });
    if (sender === "user" && sendSound) sendSound.play();
    else if (receiveSound) receiveSound.play();
  }

  if (sendBtn && userInput) {
    sendBtn.addEventListener("click", () => {
      const text = userInput.value.trim();
      if (!text) return;
      addMessage(text, "user");
      userInput.value = "";
      setTimeout(() => {
        addMessage("🤖 جارٍ التفكير...");
        setTimeout(() => addMessage("تم استلام سؤالك! سيتم الرد قريبًا 🩺"), 1000);
      }, 600);
    });

    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendBtn.click();
    });
  }

  if (attachBtn && fileInput) {
    attachBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        addMessage(`📎 تم اختيار الملف: <strong>${file.name}</strong>`, "user");
      }
    });
  }

  if (menuBtn && menuOptions) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menuOptions.style.display = menuOptions.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!menuBtn.contains(e.target) && !menuOptions.contains(e.target)) {
        menuOptions.style.display = "none";
      }
    });
  }

  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      if (currentChat.length > 0) {
        const firstUserMsg = currentChat.find((m) => m.sender === "user");
        const summary = firstUserMsg
          ? firstUserMsg.text.slice(0, 25) + (firstUserMsg.text.length > 25 ? "..." : "")
          : "محادثة بدون عنوان";

        allChats.push({
          id: Date.now(),
          summary,
          messages: currentChat,
        });

        if (localStorage) localStorage.setItem("chatHistory", JSON.stringify(allChats));
        if (typeof renderChatHistory === "function") renderChatHistory();
      }

      currentChat = [];
      if (chatBody) chatBody.innerHTML = `<div class="message bot"><p>🩺 تم بدء محادثة جديدة! كيف يمكنني مساعدتك اليوم؟</p></div>`;
      if (menuOptions) menuOptions.style.display = "none";
    });
  }

  function showSuccessMessage(text) {
    const alertBox = document.createElement("div");
    alertBox.textContent = text;
    Object.assign(alertBox.style, {
      position: "fixed",
      top: "70px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(0, 255, 200, 0.25)",
      color: "#00ffaa",
      padding: "12px 25px",
      borderRadius: "12px",
      backdropFilter: "blur(6px)",
      boxShadow: "0 0 15px rgba(0,255,255,0.4)",
      transition: "opacity 0.8s ease",
      zIndex: "9999",
      fontWeight: "bold",
      fontSize: "16px",
    });

    document.body.appendChild(alertBox);
    setTimeout(() => {
      alertBox.style.opacity = "0";
      setTimeout(() => alertBox.remove(), 800);
    }, 1500);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      const confirmBox = document.createElement("div");
      confirmBox.innerHTML = `
      <div class="confirm-overlay">
        <div class="confirm-box">
        <p style="margin: 25px;">هل أنت متأكد أنك تريد حذف كل المحادثات؟</p>
          <div class="confirm-actions">
            <button id="confirmYes">نعم</button>
            <button id="confirmNo">إلغاء</button>
          </div>
        </div>
      </div>
    `;
      document.body.appendChild(confirmBox);

      Object.assign(confirmBox.querySelector(".confirm-overlay").style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "9999",
        animation: "fadeIn 0.3s ease"
      });

      const box = confirmBox.querySelector(".confirm-box");
      Object.assign(box.style, {
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        padding: "25px 30px",
        borderRadius: "15px",
        textAlign: "center",
        color: "white",
        fontSize: "18px",
        boxShadow: "0 0 15px rgba(0,255,255,0.3)",
        border: "1px solid rgba(0,255,255,0.3)",
        animation: "popIn 0.3s ease"
      });

      const yesBtn = confirmBox.querySelector("#confirmYes");
      const noBtn = confirmBox.querySelector("#confirmNo");

      [yesBtn, noBtn].forEach((btn) =>
        Object.assign(btn.style, {
          margin: "10px",
          padding: "8px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "0.2s",
          fontSize: "15px"
        })
      );

      if (yesBtn) {
        yesBtn.style.background = "#00ffaa";
        yesBtn.style.color = "#003333";
        yesBtn.onmouseover = () => (yesBtn.style.background = "#00ffcc");
        yesBtn.onmouseout = () => (yesBtn.style.background = "#00ffaa");
        yesBtn.addEventListener("click", () => {
          if (localStorage) localStorage.removeItem("chatHistory");
          allChats = [];
          if (chatListContainer) chatListContainer.innerHTML = "";
          if (chatBody) chatBody.innerHTML = `<div class="message bot"><p>🩺 لا توجد محادثات حالياً.</p></div>`;
          showSuccessMessage("✅ تم مسح جميع المحادثات بنجاح!");
          if (deleteSound) deleteSound.play();
          confirmBox.remove();
        });
      }

      if (noBtn) {
        noBtn.style.background = "#ff4d4d";
        noBtn.style.color = "white";
        noBtn.onmouseover = () => (noBtn.style.background = "#ff6666");
        noBtn.onmouseout = () => (noBtn.style.background = "#ff4d4d");
        noBtn.addEventListener("click", () => confirmBox.remove());
      }
    });
  }

  function renderChatHistory() {
    if (!chatListContainer) return;
    chatListContainer.innerHTML = "";

    allChats.forEach((chat) => {
      const li = document.createElement("li");
      li.classList.add("chat-item");
      li.innerHTML = `
      <span class="chat-text">💬 ${chat.summary}</span>
      <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
    `;
      const deleteBtn = li.querySelector(".delete-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          deleteChat(chat.id);
        });
      }
      li.addEventListener("click", () => loadChat(chat.id));
      chatListContainer.appendChild(li);
    });
  }

  function deleteChat(id) {
    allChats = allChats.filter((c) => c.id !== id);
    if (localStorage) localStorage.setItem("chatHistory", JSON.stringify(allChats));
    renderChatHistory();
    if (deleteSound) deleteSound.play();
    showSuccessMessage("🗑️ تم حذف المحادثة بنجاح!");
  }

  function loadChat(id) {
    $qa(".chat-item").forEach(item => item.classList.remove("active"));

    const chatObj = allChats.find(c => c.id === id);
    const currentItem = Array.from($qa(".chat-item")).find(li => {
      return li.querySelector(".chat-text") && chatObj && li.querySelector(".chat-text").textContent.includes(chatObj.summary);
    });
    if (currentItem) currentItem.classList.add("active");
    if (!chatObj || !chatBody) return;
    chatBody.innerHTML = "";
    currentChat = chatObj.messages;
    chatObj.messages.forEach((msg) => addMessage(msg.text, msg.sender));
    if (menuOptions) menuOptions.style.display = "none";
  }

  // initial render
  renderChatHistory();

});
