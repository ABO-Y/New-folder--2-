const mockProducts = [
  {
    id: 101,
    name: "4K UltraWide Monitor",
    price: 349.99,
    image: "https://via.placeholder.com/400x260.png?text=4K+Monitor",
    category: "monitors",
    description: "A crisp 32-inch display with ultra-wide coverage and vivid color for demanding workstations.",
    tags: ["Best Seller", "High Res"]
  },
  {
    id: 102,
    name: "RGB Mechanical Keyboard",
    price: 79.99,
    image: "https://via.placeholder.com/400x260.png?text=RGB+Keyboard",
    category: "keyboards",
    description: "Silent switches, customizable lighting, and a durable aluminum frame for lasting comfort.",
    tags: ["Hot Pick", "Tactile"]
  },
  {
    id: 103,
    name: "Wireless Ergonomic Mouse",
    price: 49.99,
    image: "https://via.placeholder.com/400x260.png?text=Wireless+Mouse",
    category: "accessories",
    description: "A sculpted shape designed to reduce fatigue during long sessions, with fast wireless response.",
    tags: ["Ergonomic", "Fast"]
  },
  {
    id: 104,
    name: "Studio Noise-Canceling Headphones",
    price: 199.99,
    image: "https://via.placeholder.com/400x260.png?text=Headphones",
    category: "audio",
    description: "Premium noise-canceling audio with balanced sound and soft memory foam ear cushions.",
    tags: ["Premium", "Quiet"]
  }
];

const CART_KEY = 'techvault_cart_v1';
let filters = { query: '', category: 'all' };

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}

function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  el.textContent = count;
}

function getFilteredProducts() {
  return mockProducts.filter(product => {
    const matchesCategory = filters.category === 'all' || product.category === filters.category;
    const matchesQuery = product.name.toLowerCase().includes(filters.query) || product.description.toLowerCase().includes(filters.query);
    return matchesCategory && matchesQuery;
  });
}

function renderCatalog() {
  const gridContainer = document.getElementById('product-grid');
  const productCount = document.getElementById('product-count');
  if (!gridContainer) return;

  const filteredProducts = getFilteredProducts();
  productCount.textContent = `${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'} available`;

  gridContainer.innerHTML = filteredProducts.map(product => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <div class="tag-list">
        ${product.tags.map(tag => `<span class="tag-badge">${tag}</span>`).join('')}
      </div>
      <p class="description">${product.description}</p>
      <p class="price">$${product.price.toFixed(2)}</p>
      <button class="add-btn" data-id="${product.id}" type="button">Add to Cart</button>
    </article>
  `).join('');

  gridContainer.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAddToCart(Number(btn.dataset.id)));
  });
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-panel');
  const backdrop = document.getElementById('drawer-backdrop');
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  backdrop.classList.add('visible');
  backdrop.hidden = false;
  renderCart();
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-panel');
  const backdrop = document.getElementById('drawer-backdrop');
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  backdrop.classList.remove('visible');
  setTimeout(() => { backdrop.hidden = true; }, 240);
}

function renderCart() {
  const itemsContainer = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const cart = getCart();
  const total = cart.reduce((sum, item) => {
    const product = mockProducts.find(p => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  if (!itemsContainer || !totalEl) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = '<p class="cart-empty">Your cart is currently empty.</p>';
  } else {
    itemsContainer.innerHTML = cart.map(item => {
      const product = mockProducts.find(p => p.id === item.id);
      if (!product) return '';
      return `
        <div class="cart-item">
          <div class="cart-item-info">
            <div class="cart-item-name">${product.name}</div>
            <div class="cart-item-meta">$${product.price.toFixed(2)} × ${item.quantity}</div>
          </div>
          <div class="cart-actions">
            <div class="quantity-control" data-id="${item.id}">
              <button type="button" class="quantity-decrease" aria-label="Decrease quantity">−</button>
              <span>${item.quantity}</span>
              <button type="button" class="quantity-increase" aria-label="Increase quantity">+</button>
            </div>
            <button class="remove-item" type="button" data-id="${item.id}">Remove</button>
          </div>
        </div>
      `;
    }).join('');

    itemsContainer.querySelectorAll('.quantity-decrease').forEach(button => {
      button.addEventListener('click', () => updateCartQuantity(Number(button.closest('.quantity-control').dataset.id), -1));
    });
    itemsContainer.querySelectorAll('.quantity-increase').forEach(button => {
      button.addEventListener('click', () => updateCartQuantity(Number(button.closest('.quantity-control').dataset.id), 1));
    });
    itemsContainer.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', () => removeCartItem(Number(button.dataset.id)));
    });
  }

  totalEl.textContent = `$${total.toFixed(2)}`;
}

function updateCartQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity < 1) {
    removeCartItem(productId);
    return;
  }
  setCart(cart);
  renderCart();
}

function removeCartItem(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  setCart(cart);
  renderCart();
}

function handleAddToCart(productId) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  setCart(cart);
  showToast('Added to cart successfully');
}

function showToast(message) {
  const prev = document.querySelector('.toast-notice');
  if (prev) prev.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-notice';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function setupControls() {
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const cartBtn = document.getElementById('cart-btn');
  const heroCartBtn = document.getElementById('hero-cart-btn');
  const cartClose = document.getElementById('cart-close');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (searchInput) {
    searchInput.addEventListener('input', event => {
      filters.query = event.target.value.toLowerCase();
      renderCatalog();
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', event => {
      filters.category = event.target.value;
      renderCatalog();
    });
  }

  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
  if (heroCartBtn) heroCartBtn.addEventListener('click', openCartDrawer);
  if (cartClose) cartClose.addEventListener('click', closeCartDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeCartDrawer);
  if (checkoutBtn) checkoutBtn.addEventListener('click', () => alert('Checkout is coming soon!'));

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!expanded));
      navLinks.classList.toggle('mobile-open');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
  updateCartCount();
  setupControls();
});
