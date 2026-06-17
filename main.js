// Utility function to safely get the cart array out of browser storage
function getCart() {
  const savedCart = localStorage.getItem('shopping_cart');
  return savedCart ? JSON.parse(savedCart) : [];
}

// Utility function to save the modified cart array back to browser storage
function saveCart(cartArray) {
  localStorage.setItem('shopping_cart', JSON.stringify(cartArray));
  updateCartBadge();
}

// Scans the active cart array and counts total items to update the header UI badge
function updateCartBadge() {
  const cart = getCart();
  // Sum up all item quantities
  const totalItems = cart.reduce((accumulator, item) => accumulator + item.quantity, 0);
  
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = totalItems;
  }
}

// Automatically sync and display the correct item count when any page finishes loading
document.addEventListener('DOMContentLoaded', updateCartBadge);
