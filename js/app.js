// ── DATA STORE ──────────────────────────────────────────────────────────────
const DB = {
  products: [
    { id: 1, name: 'Choco Lava Cake', emoji: '🍫', price: 180, stock: 24, desc: 'Warm molten center, rich dark chocolate', category: 'bestseller', available: true },
    { id: 2, name: 'Red Velvet', emoji: '🎂', price: 250, stock: 18, desc: 'Classic cream cheese frosting, velvety texture', category: 'classic', available: true },
    { id: 3, name: 'Blueberry Cheesecake', emoji: '🫐', price: 320, stock: 10, desc: 'NY-style with fresh blueberry compote', category: 'premium', available: true },
    { id: 4, name: 'Mango Mousse', emoji: '🥭', price: 210, stock: 15, desc: 'Light mousse with alphonso mango', category: 'seasonal', available: true },
    { id: 5, name: 'Truffle Cake', emoji: '⚫', price: 380, stock: 8, desc: 'Belgian truffle, 72% cocoa', category: 'premium', available: true },
    { id: 6, name: 'Strawberry Shortcake', emoji: '🍓', price: 195, stock: 20, desc: 'Fresh strawberries, whipped cream layers', category: 'classic', available: true },
    { id: 7, name: 'Pineapple Upside Down', emoji: '🍍', price: 160, stock: 0, desc: 'Caramelized pineapple, buttery base', category: 'classic', available: false },
    { id: 8, name: 'Carrot Walnut Cake', emoji: '🥕', price: 220, stock: 12, desc: 'Spiced carrot with cream cheese & walnuts', category: 'classic', available: true },
  ],

  orders: [
    { id: 'ORD-1001', customer: 'Priya Sharma', phone: '9876543210', email: 'priya@email.com', items: [{id:1,name:'Choco Lava Cake',emoji:'🍫',qty:2,price:180},{id:2,name:'Red Velvet',emoji:'🎂',qty:1,price:250}], total: 610, status: 'baking', date: new Date(Date.now()-3600000).toISOString(), address: '12 MG Road, Mumbai', type: 'delivery', note: 'Extra chocolate sauce please' },
    { id: 'ORD-1002', customer: 'Rahul Mehta', phone: '9123456789', email: 'rahul@email.com', items: [{id:3,name:'Blueberry Cheesecake',emoji:'🫐',qty:1,price:320}], total: 320, status: 'confirmed', date: new Date(Date.now()-7200000).toISOString(), address: '', type: 'pickup', note: '' },
    { id: 'ORD-1003', customer: 'Sneha Joshi', phone: '9988776655', email: 'sneha@email.com', items: [{id:4,name:'Mango Mousse',emoji:'🥭',qty:3,price:210}], total: 630, status: 'ready', date: new Date(Date.now()-10800000).toISOString(), address: '5 Park Avenue, Pune', type: 'delivery', note: '' },
    { id: 'ORD-1004', customer: 'Amit Patel', phone: '9001122334', email: 'amit@email.com', items: [{id:5,name:'Truffle Cake',emoji:'⚫',qty:2,price:380}], total: 760, status: 'delivered', date: new Date(Date.now()-86400000).toISOString(), address: '8 Lake View, Nashik', type: 'delivery', note: '' },
    { id: 'ORD-1005', customer: 'Kavya Nair', phone: '9112233445', email: 'kavya@email.com', items: [{id:1,name:'Choco Lava Cake',emoji:'🍫',qty:1,price:180},{id:6,name:'Strawberry Shortcake',emoji:'🍓',qty:2,price:195}], total: 570, status: 'placed', date: new Date(Date.now()-1800000).toISOString(), address: '3 Hill Top, Lonavala', type: 'delivery', note: 'Birthday delivery, please add candles!' },
  ],

  sales: [
    { date: today(), product: 'Choco Lava Cake', emoji: '🍫', qty: 5, price: 180, total: 900, bill: 'BILL-001', addedBy: 'manager' },
    { date: today(), product: 'Red Velvet', emoji: '🎂', qty: 3, price: 250, total: 750, bill: 'BILL-002', addedBy: 'manager' },
    { date: today(), product: 'Truffle Cake', emoji: '⚫', qty: 2, price: 380, total: 760, bill: 'BILL-003', addedBy: 'manager' },
  ],

  users: [
    { id: 1, name: 'Sunita Bakshi', email: 'admin@cakebliss.com', password: 'admin123', role: 'admin' },
    { id: 2, name: 'Raju Manager', email: 'manager@cakebliss.com', password: 'manager123', role: 'manager' },
    { id: 3, name: 'Priya Sharma', email: 'priya@email.com', password: 'customer123', role: 'customer' },
  ],

  settings: {
    shopName: 'Cake Bliss',
    tagline: 'Baked with love, delivered with joy',
    announceText: '🎉 Free delivery on orders above ₹500! Use code SWEET10 for 10% off',
    phone: '+91 98765 43210',
    email: 'hello@cakebliss.com',
    address: '42 Baker Street, Mumbai, MH 400001',
    themeColor: '#7B4A2D',
    accentColor: '#E8A83E',
  }
};

function today() {
  return new Date().toISOString().split('T')[0];
}

// ── CART ────────────────────────────────────────────────────────────────────
let cart = [];
let currentUser = null;

function addToCart(productId) {
  const p = DB.products.find(x => x.id === productId);
  if (!p || !p.available) return;
  const existing = cart.find(x => x.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...p, qty: 1 });
  }
  updateCartUI();
  showToast(`${p.emoji} ${p.name} added to cart!`);
}

function removeFromCart(productId) {
  cart = cart.filter(x => x.id !== productId);
  updateCartUI();
}

function changeQty(productId, delta) {
  const item = cart.find(x => x.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(productId);
  else updateCartUI();
}

function cartTotal() {
  return cart.reduce((s, x) => s + x.price * x.qty, 0);
}

function cartCount() {
  return cart.reduce((s, x) => s + x.qty, 0);
}

function updateCartUI() {
  const count = cartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'inline-flex' : 'none';
  });
  renderCartItems();
}

function renderCartItems() {
  const el = document.getElementById('cart-items');
  if (!el) return;
  if (cart.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">🧺<br><br>Your cart is empty</div>';
    document.getElementById('cart-total-amount').textContent = '₹0';
    return;
  }
  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price} × ${item.qty} = ₹${item.price * item.qty}</div>
      </div>
      <div class="qty-ctrl">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span style="font-weight:500;min-width:20px;text-align:center">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
  document.getElementById('cart-total-amount').textContent = `₹${cartTotal()}`;
}

function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

// ── ROUTING ─────────────────────────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) {
    page.classList.add('active');
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageId);
  });
  if (pageId === 'menu') renderMenu();
  if (pageId === 'checkout') renderCheckoutSummary();
  if (pageId === 'track') renderTrackPage();
}

// ── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── AUTH ─────────────────────────────────────────────────────────────────────
function login(email, password) {
  const user = DB.users.find(u => u.email === email && u.password === password);
  if (user) {
    currentUser = user;
    if (user.role === 'admin') window.location.href = 'admin/index.html';
    else if (user.role === 'manager') window.location.href = 'manager/index.html';
    else {
      closeModal('login-modal');
      updateAuthUI();
      showToast(`Welcome back, ${user.name.split(' ')[0]}! 🎂`);
    }
    return true;
  }
  return false;
}

function logout() {
  currentUser = null;
  updateAuthUI();
  showPage('home');
}

function updateAuthUI() {
  const loginBtn = document.getElementById('btn-login');
  const userMenu = document.getElementById('user-menu');
  if (loginBtn && userMenu) {
    if (currentUser) {
      loginBtn.style.display = 'none';
      userMenu.style.display = 'flex';
      document.getElementById('user-name').textContent = currentUser.name.split(' ')[0];
    } else {
      loginBtn.style.display = 'inline-flex';
      userMenu.style.display = 'none';
    }
  }
}

// ── MODALS ──────────────────────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('show');
  document.getElementById('overlay').classList.add('show');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  if (!document.getElementById('cart-sidebar').classList.contains('open')) {
    document.getElementById('overlay').classList.remove('show');
  }
}

// ── ORDER STATUS ─────────────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: 'placed', label: 'Order Placed', emoji: '📝' },
  { key: 'confirmed', label: 'Confirmed', emoji: '✅' },
  { key: 'baking', label: 'Baking', emoji: '🔥' },
  { key: 'ready', label: 'Ready', emoji: '🎂' },
  { key: 'delivered', label: 'Delivered', emoji: '🚀' },
];

function getStatusIndex(status) {
  return STATUS_STEPS.findIndex(s => s.key === status);
}

function renderStatusBar(status) {
  const currentIdx = getStatusIndex(status);
  let html = '<div class="status-steps">';
  STATUS_STEPS.forEach((step, i) => {
    const isDone = i < currentIdx;
    const isActive = i === currentIdx;
    html += `<div class="status-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}">
      <div class="status-dot">${step.emoji}</div>
      <div class="status-label">${step.label}</div>
    </div>`;
    if (i < STATUS_STEPS.length - 1) {
      html += `<div class="status-line ${isDone ? 'done' : ''}"></div>`;
    }
  });
  html += '</div>';
  return html;
}

function placeOrder(customerData) {
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }
  const orderId = 'ORD-' + (1000 + DB.orders.length + 1);
  const order = {
    id: orderId,
    customer: customerData.name,
    phone: customerData.phone,
    email: customerData.email,
    items: cart.map(x => ({ id: x.id, name: x.name, emoji: x.emoji, qty: x.qty, price: x.price })),
    total: cartTotal(),
    status: 'placed',
    date: new Date().toISOString(),
    address: customerData.address,
    type: customerData.type,
    note: customerData.note || '',
  };
  DB.orders.unshift(order);
  cart.forEach(item => {
    const p = DB.products.find(x => x.id === item.id);
    if (p) p.stock = Math.max(0, p.stock - item.qty);
  });
  cart = [];
  updateCartUI();
  showToast(`✅ Order ${orderId} placed successfully!`);
  sessionStorage.setItem('lastOrderId', orderId);
  showPage('track');
}

function renderTrackPage() {
  const el = document.getElementById('track-content');
  if (!el) return;
  const orderId = sessionStorage.getItem('lastOrderId');
  if (!orderId) {
    el.innerHTML = renderTrackForm();
    return;
  }
  const order = DB.orders.find(o => o.id === orderId);
  if (order) renderOrderStatus(el, order);
  else el.innerHTML = renderTrackForm();
}

function renderTrackForm() {
  return `
    <div class="track-card" style="max-width:480px">
      <h2 style="margin-bottom:8px">Track Your Order</h2>
      <p style="color:var(--text-muted);margin-bottom:28px">Enter your Order ID or phone number</p>
      <div class="form-group">
        <label>Order ID or Phone Number</label>
        <input type="text" id="track-input" placeholder="e.g. ORD-1001 or 9876543210">
      </div>
      <button class="btn btn-primary btn-lg" style="width:100%" onclick="doTrack()">Track Order</button>
    </div>`;
}

function doTrack() {
  const val = document.getElementById('track-input').value.trim();
  const order = DB.orders.find(o => o.id === val || o.phone === val);
  const el = document.getElementById('track-content');
  if (order) renderOrderStatus(el, order);
  else showToast('Order not found. Try ORD-1001 or 9876543210');
}

function renderOrderStatus(el, order) {
  el.innerHTML = `
    <div class="track-card">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
        <div>
          <h2>${order.id}</h2>
          <p style="color:var(--text-muted);font-size:0.9rem">${order.customer} · ${new Date(order.date).toLocaleString('en-IN')}</p>
        </div>
        <span class="badge-${order.status === 'delivered' ? 'avail' : 'soldout'}" style="font-size:0.82rem;padding:6px 14px">
          ${STATUS_STEPS.find(s=>s.key===order.status)?.label || order.status}
        </span>
      </div>
      ${renderStatusBar(order.status)}
      <div style="border:1px solid var(--border);border-radius:12px;padding:20px;margin-top:24px">
        <div style="font-weight:500;margin-bottom:12px">Order Items</div>
        ${order.items.map(item => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:0.9rem">
            <span>${item.emoji} ${item.name} × ${item.qty}</span>
            <span style="font-weight:500">₹${item.price * item.qty}</span>
          </div>
        `).join('')}
        <div style="display:flex;justify-content:space-between;padding-top:12px;font-weight:600;font-size:1rem">
          <span>Total</span><span style="color:var(--cocoa)">₹${order.total}</span>
        </div>
      </div>
      ${order.note ? `<div style="background:var(--blush);border-radius:10px;padding:14px 18px;margin-top:16px;font-size:0.88rem;color:var(--cocoa)">📝 Note: ${order.note}</div>` : ''}
      <button class="btn btn-outline" style="margin-top:20px;width:100%" onclick="renderTrackForm(); document.getElementById('track-content').innerHTML = renderTrackForm()">Track another order</button>
    </div>`;
}

// ── RENDER MENU ──────────────────────────────────────────────────────────────
function renderMenu(filter = 'all') {
  const el = document.getElementById('menu-grid');
  if (!el) return;
  const filtered = filter === 'all' ? DB.products : DB.products.filter(p => p.category === filter);
  el.innerHTML = filtered.map(p => `
    <div class="cake-card">
      <div class="cake-img">${p.emoji}</div>
      <div class="cake-info">
        <div class="cake-name">${p.name}</div>
        <div class="cake-desc">${p.desc}</div>
        <div class="cake-footer">
          <div class="cake-price">₹${p.price}</div>
          ${p.available && p.stock > 0
            ? `<button class="btn btn-primary btn-sm" onclick="addToCart(${p.id})">Add to Cart</button>`
            : `<span class="badge-soldout">Sold Out</span>`}
        </div>
      </div>
    </div>
  `).join('');
}

function renderCheckoutSummary() {
  const el = document.getElementById('checkout-summary');
  if (!el) return;
  if (cart.length === 0) {
    showPage('menu'); showToast('Add items to cart first!'); return;
  }
  el.innerHTML = `
    <div class="order-summary-box">
      <h3 style="margin-bottom:20px;font-size:1.2rem">Order Summary</h3>
      ${cart.map(item => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:0.9rem">
          <span>${item.emoji} ${item.name} × ${item.qty}</span>
          <span style="font-weight:500">₹${item.price * item.qty}</span>
        </div>
      `).join('')}
      <div style="display:flex;justify-content:space-between;padding:16px 0 8px;font-weight:600;font-size:1.1rem">
        <span>Total</span><span style="color:var(--cocoa)">₹${cartTotal()}</span>
      </div>
      <div style="font-size:0.8rem;color:var(--sage)">✅ Free delivery on this order!</div>
    </div>`;
}

// ── APPLY SETTINGS ───────────────────────────────────────────────────────────
function applySettings() {
  const s = DB.settings;
  document.querySelectorAll('.shop-name').forEach(el => el.textContent = s.shopName);
  const ab = document.getElementById('announce-text');
  if (ab) ab.textContent = s.announceText;
  document.title = s.shopName;
}

document.addEventListener('DOMContentLoaded', () => {
  applySettings();
  updateCartUI();
  renderMenu();
  document.getElementById('overlay').addEventListener('click', () => {
    closeCart();
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
    document.getElementById('overlay').classList.remove('show');
  });
});
