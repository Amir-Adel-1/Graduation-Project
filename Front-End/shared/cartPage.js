async function renderCart() {
  const box = document.getElementById("cartItems");
  box.innerHTML = "جاري تحميل الكارت...";

  const cart = await cartApi.getMy();

  if (!cart.items || cart.items.length === 0) {
    box.innerHTML = "<p>الكارت فاضي</p>";
    document.getElementById("cartTotal").textContent = "0";
    return;
  }

  box.innerHTML = "";

  cart.items.forEach(i => {
    const div = document.createElement("div");
    div.className = "row";

    div.innerHTML = `
      <div style="flex:1">
        <div class="name">${i.productApiName}</div>
        <div class="meta">
          السعر: ${i.price} | الإجمالي: ${i.lineTotal}
        </div>
      </div>

      <div>
        <button class="btn" onclick="dec(${i.idCartItem}, ${i.quantity})">-</button>
        <span class="qty">${i.quantity}</span>
        <button class="btn" onclick="inc(${i.idCartItem}, ${i.quantity})">+</button>
      </div>

      <div>
        <button class="btn btn-danger" onclick="removeItem(${i.idCartItem})">Remove</button>
      </div>
    `;

    box.appendChild(div);
  });

  document.getElementById("cartTotal").textContent = cart.totalPrice ?? 0;
}

async function inc(itemId, q) {
  await cartApi.updateQty(itemId, q + 1);
  await renderCart();
}

async function dec(itemId, q) {
  const newQ = q - 1;
  if (newQ <= 0) {
    await cartApi.remove(itemId);
  } else {
    await cartApi.updateQty(itemId, newQ);
  }
  await renderCart();
}

async function removeItem(itemId) {
  await cartApi.remove(itemId);
  await renderCart();
}

async function clearMyCart() {
  await cartApi.clear();
  await renderCart();
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart().catch(err => {
    console.error(err);
    document.getElementById("cartItems").innerHTML =
      "<p>حصل خطأ في تحميل الكارت</p>";
  });
});
