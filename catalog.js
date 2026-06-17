// Mock database (client-side)
const mockProducts = [
  { id: 101, name: "4K UltraWide Monitor", price: 349.99, image: "https://via.placeholder.com/400x200.png?text=4K+Monitor" },
  { id: 102, name: "RGB Mechanical Keyboard", price: 79.99, image: "https://via.placeholder.com/400x200.png?text=Keyboard" },
  { id: 103, name: "Wireless Ergonomic Mouse", price: 49.99, image: "https://via.placeholder.com/400x200.png?text=Wireless+Mouse" },
  { id: 104, name: "Studio Noise-Canceling Headphones", price: 199.99, image: "https://via.placeholder.com/400x200.png?text=Headphones" }
];

const CART_KEY = 'techvault_cart_v1';

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
  el.textContent = getCart().length;
}

function renderCatalog() {
  const gridContainer = document.getElementById('product-grid');
  if (!gridContainer) return;

  // Build markup using map/join for better performance than repeated innerHTML +=
  gridContainer.innerHTML = mockProducts.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p class="price">$${product.price.toFixed(2)}</p>
      <button class="add-btn" data-id="${product.id}">Add to Cart</button>
    </div>
  `).join('');

  // Attach event listeners to rendered buttons
  gridContainer.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAddToCart(Number(btn.dataset.id)));
  });
}

function handleAddToCart(productId) {
  const product = mockProducts.find(p => p.id === productId);
  if (!product) return;
  const cart = getCart();
  cart.push({ id: product.id, name: product.name, price: product.price, addedAt: Date.now() });
  setCart(cart);

  // Small non-blocking notification
  const prev = document.querySelector('.toast-notice');
  if (prev) prev.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-notice';
  toast.textContent = `${product.name} added to cart`;
  toast.style.position = 'fixed';
  toast.style.right = '16px';
  toast.style.bottom = '20px';
  toast.style.padding = '10px 14px';
  toast.style.background = 'linear-gradient(90deg, var(--purple), var(--purple-light))';
  toast.style.color = 'white';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
  document.body.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
  updateCartCount();
});
