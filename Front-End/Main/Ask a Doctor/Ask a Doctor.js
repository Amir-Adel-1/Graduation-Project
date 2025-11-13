// ===============================
// 💬 Chat Bot System — Final Version + Sounds + Hover Delete
// ===============================

// العناصر الأساسية
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatBody = document.getElementById("chatBody");
const attachBtn = document.getElementById("attachBtn");
const fileInput = document.getElementById("fileInput");

// منيو العناصر
const menuBtn = document.getElementById("menuBtn");
const menuOptions = document.getElementById("menuOptions");
const newChatBtn = document.getElementById("newChat");
const chatListContainer = document.getElementById("chatList");
const clearBtn = document.getElementById("clearChats");

// ===============================
// 📦 المتغيرات
// ===============================
let allChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
let currentChat = [];

// 🔊 مؤثرات صوتية
const sendSound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_7a5f3a3e35.mp3");      // عند الإرسال
const receiveSound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_69f16db3b2.mp3");   // عند الرد
const deleteSound = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_5b3bb1b37b.mp3");    // عند الحذف

// ===============================
// 🧠 دالة إضافة رسالة
// ===============================
function addMessage(text, sender = "bot") {
  const message = document.createElement("div");
  message.classList.add("message", sender);
  message.innerHTML = `<p>${text}</p>`;
  chatBody.appendChild(message);
  chatBody.scrollTop = chatBody.scrollHeight;

  currentChat.push({ sender, text });

  // 🎵 صوت مناسب
  if (sender === "user") sendSound.play();
  else receiveSound.play();
}

// ===============================
// 🚀 إرسال الرسالة
// ===============================
sendBtn.addEventListener("click", () => {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";

  setTimeout(() => {
    addMessage("🤖 جارٍ التفكير...");
    setTimeout(() => {
      addMessage("تم استلام سؤالك! سيتم الرد قريبًا 🩺");
    }, 1000);
  }, 600);
});

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

// ===============================
// 📎 رفع ملف
// ===============================
attachBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    addMessage(`📎 تم اختيار الملف: <strong>${file.name}</strong>`, "user");
  }
});

// ===============================
// 📜 منيو الفتح والغلق
// ===============================
menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  menuOptions.style.display =
    menuOptions.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", (e) => {
  if (!menuBtn.contains(e.target) && !menuOptions.contains(e.target)) {
    menuOptions.style.display = "none";
  }
});

// ===============================
// 🆕 شات جديد
// ===============================
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

    localStorage.setItem("chatHistory", JSON.stringify(allChats));
    renderChatHistory();
  }

  currentChat = [];
  chatBody.innerHTML = `<div class="message bot"><p>🩺 تم بدء محادثة جديدة! كيف يمكنني مساعدتك اليوم؟</p></div>`;
  menuOptions.style.display = "none";
});

// ===============================
// 🗑️ مسح كل المحادثات
// ===============================
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

// ===============================
// 🗑️ مسح كل المحادثات (بـ Popup أنيق)
// ===============================
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

    // 🌌 تنسيق الخلفية الشفافة
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

    // 💬 تنسيق الصندوق
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

    // 🎨 الأزرار
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

    yesBtn.style.background = "#00ffaa";
    yesBtn.style.color = "#003333";
    yesBtn.onmouseover = () => (yesBtn.style.background = "#00ffcc");
    yesBtn.onmouseout = () => (yesBtn.style.background = "#00ffaa");

    noBtn.style.background = "#ff4d4d";
    noBtn.style.color = "white";
    noBtn.onmouseover = () => (noBtn.style.background = "#ff6666");
    noBtn.onmouseout = () => (noBtn.style.background = "#ff4d4d");

    // ✅ تنفيذ الحذف عند الضغط على "نعم"
    yesBtn.addEventListener("click", () => {
      localStorage.removeItem("chatHistory");
      allChats = [];
      chatListContainer.innerHTML = "";
      chatBody.innerHTML = `<div class="message bot"><p>🩺 لا توجد محادثات حالياً.</p></div>`;
      showSuccessMessage("✅ تم مسح جميع المحادثات بنجاح!");
      deleteSound.play();
      confirmBox.remove();
    });

    // ❌ إلغاء العملية
    noBtn.addEventListener("click", () => confirmBox.remove());
  });
}


// ===============================
// 📋 عرض الهيستوري مع زر الحذف عند الهوفر
// ===============================
function renderChatHistory() {
  chatListContainer.innerHTML = "";

  allChats.forEach((chat) => {
    const li = document.createElement("li");
    li.classList.add("chat-item");

    li.innerHTML = `
      <span class="chat-text">💬 ${chat.summary}</span>
      <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
    `;

    const deleteBtn = li.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteChat(chat.id);
    });

    li.addEventListener("click", () => loadChat(chat.id));
    chatListContainer.appendChild(li);
  });
}

// ===============================
// ❌ حذف محادثة واحدة
// ===============================
function deleteChat(id) {
  allChats = allChats.filter((c) => c.id !== id);
  localStorage.setItem("chatHistory", JSON.stringify(allChats));
  renderChatHistory();
  deleteSound.play(); // 🔊 صوت عند الحذف
  showSuccessMessage("🗑️ تم حذف المحادثة بنجاح!");
}

// ===============================
// 📂 تحميل محادثة قديمة
// ===============================
function loadChat(id) {
  // 🔹 شيل الـ active من كل العناصر الأول
  document.querySelectorAll(".chat-item").forEach(item => item.classList.remove("active"));

  // 🔹 ضيف الـ active على العنصر اللي اتضغط عليه
  const currentItem = Array.from(document.querySelectorAll(".chat-item")).find(li => {
    return li.querySelector(".chat-text").textContent.includes(allChats.find(c => c.id === id).summary);
  });
  if (currentItem) currentItem.classList.add("active");

  // 🔹 حمّل المحادثة
  const chat = allChats.find((c) => c.id === id);
  if (!chat) return;
  chatBody.innerHTML = "";
  currentChat = chat.messages;
  chat.messages.forEach((msg) => addMessage(msg.text, msg.sender));
  menuOptions.style.display = "none";
}


// عند تحميل الصفحة
renderChatHistory();


