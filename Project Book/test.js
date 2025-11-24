// فتح البوب
document.getElementById("openCashBtn").onclick = function () {
  document.getElementById("cashPopup").style.display = "flex";
};

// غلق بالزر
document.getElementById("closeCashBtn").onclick = function () {
  document.getElementById("cashPopup").style.display = "none";
};

// غلق عند الضغط خارج الصندوق
window.addEventListener("click", function (e) {
  let popup = document.getElementById("cashPopup");

  if (e.target === popup) {
    popup.style.display = "none";
  }
});
