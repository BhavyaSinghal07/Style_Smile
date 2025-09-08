const API_URL = "/api";
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// ---- Home page: load products ----
if (document.getElementById("product-list")) {
  fetch(`${API_URL}/products`)
    .then(r => r.json())
    .then(data => {
      const container = document.getElementById("product-list");
      container.innerHTML = "";
      data.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${p.image}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p>${p.description.substring(0, 50)}...</p>
          <p><b>₹${p.price}</b></p>
          <button onclick="viewProduct(${p.id})">View</button>
          <button onclick="addToCart(${p.id}, '${p.name}', ${p.price}, '${p.image}')">Add to Cart</button>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error(err));
}

// ---- View product ----
function viewProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

// ---- Product details ----
if (document.getElementById("product-details")) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  fetch(`${API_URL}/products/${id}`)
    .then(r => r.json())
    .then(p => {
      document.getElementById("product-details").innerHTML = `
        <img src="${p.image}" alt="${p.name}" style="width:300px; border-radius:10px;">
        <h2>${p.name}</h2>
        <p>${p.description}</p>
        <p><b>Price: ₹${p.price}</b></p>
        <button onclick="addToCart(${p.id}, '${p.name}', ${p.price}, '${p.image}')">Add to Cart</button>
      `;
    });
}

// ---- Toast Notification ----
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.className = "show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 2000); // 2 seconds
}

// ---- Add to cart ----
function addToCart(id, name, price, image) {
  let existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id, name, price, image, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  showToast(`"${name}" successfully added to cart!`);
}


// ---- Render cart ----
function renderCart() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!container) return;

  container.innerHTML = "";
  if (cart.length === 0) {
    container.innerHTML = "<p>Cart is empty.</p>";
    totalEl.innerText = "";
    return;
  }

  let total = 0;
  cart.forEach((item, idx) => {
    total += item.price * item.quantity;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div>
        <img src="${item.image}" alt="${item.name}" style="width:50px; vertical-align:middle; border-radius:5px; margin-right:8px;">
        <span>${item.name} - ₹${item.price} x ${item.quantity}</span>
      </div>
      <div>
        <button onclick="changeQty(${idx}, -1)">-</button>
        <button onclick="changeQty(${idx}, 1)">+</button>
        <button onclick="removeFromCart(${idx})">Remove</button>
      </div>
    `;
    container.appendChild(div);
  });

  totalEl.innerText = `Total: ₹${total}`;
}

// ---- Change quantity ----
function changeQty(idx, delta) {
  cart[idx].quantity += delta;
  if (cart[idx].quantity <= 0) {
    cart.splice(idx, 1);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// ---- Remove item ----
function removeFromCart(idx) {
  cart.splice(idx, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// ---- DOM loaded: render cart + place order ----
window.addEventListener("DOMContentLoaded", () => {
  renderCart();

  const placeOrderBtn = document.getElementById("place-order");
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", () => {
      if (cart.length === 0) return alert("Cart empty");
      // For demo: alert order placed
      alert("Order placed!");
      localStorage.removeItem("cart");
      cart = [];
      renderCart();
      window.location.href = "index.html";
    });
  }
});

// ---- Modal Login/Register ----
const loginModal = document.getElementById("loginModal");
const registerModal = document.getElementById("registerModal");

if (loginModal && registerModal) {
  document.getElementById("loginBtn").onclick = () => loginModal.style.display = "block";
  document.getElementById("registerBtn").onclick = () => registerModal.style.display = "block";
  document.getElementById("closeLogin").onclick = () => loginModal.style.display = "none";
  document.getElementById("closeRegister").onclick = () => registerModal.style.display = "none";

  document.getElementById("openRegister").onclick = () => {
    loginModal.style.display = "none";
    registerModal.style.display = "block";
  };

  document.getElementById("openLogin").onclick = () => {
    registerModal.style.display = "none";
    loginModal.style.display = "block";
  };

  window.onclick = e => {
    if (e.target == loginModal) loginModal.style.display = "none";
    if (e.target == registerModal) registerModal.style.display = "none";
  };
}



// Login
async function login(username, password) {
  const res = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  localStorage.setItem("token", data.token);
  localStorage.setItem("username", data.username);
  alert("Logged in as " + data.username);
}

