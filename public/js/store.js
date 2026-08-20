// Client State & API Client Store for Fashnora

const API_BASE = '/api';

const store = {
  state: {
    user: JSON.parse(localStorage.getItem('fash_user')) || null,
    token: localStorage.getItem('fash_token') || null,
    cart: JSON.parse(localStorage.getItem('fash_cart')) || [],
    wishlist: JSON.parse(localStorage.getItem('fash_wishlist')) || [],
    settings: {},
    banners: []
  },

  // Initialize store: fetch global parameters
  async init() {
    try {
      const sets = await this.apiCall('/settings');
      if (sets) this.state.settings = sets;

      const bans = await this.apiCall('/banners');
      if (bans) this.state.banners = bans;
      
      // Update UI elements based on loaded settings
      const announcement = document.getElementById('announcement-text');
      if (announcement) {
        const textBanner = this.state.banners.find(b => b.section === 'announcement');
        if (textBanner) {
          announcement.innerText = textBanner.subtitle;
        } else if (this.state.settings.store_name) {
          announcement.innerText = `WELCOME TO ${this.state.settings.store_name} • FREE SHIPPING ON ORDERS ABOVE ₹${this.state.settings.free_shipping_threshold}`;
        }
      }

      this.updateCartCount();
      this.updateWishlistCount();
    } catch (e) {
      console.error('Store init error:', e.message);
    }
  },

  // Generic Request Helper
  async apiCall(endpoint, method = 'GET', body = null, authenticated = false) {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (authenticated && this.state.token) {
      headers['Authorization'] = `Bearer ${this.state.token}`;
    }

    const config = {
      method,
      headers
    };
    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      return data;
    } catch (error) {
      console.error(`API Call failed to ${endpoint}:`, error.message);
      throw error;
    }
  },

  // Auth Operations
  async login(email, password) {
    const response = await this.apiCall('/auth/login', 'POST', { email, password });
    if (response && response.token) {
      this.state.token = response.token;
      this.state.user = response.user;
      localStorage.setItem('fash_token', response.token);
      localStorage.setItem('fash_user', JSON.stringify(response.user));
      this.showToast('Login successful. Welcome back!');
      return response.user;
    }
  },

  logout() {
    this.state.token = null;
    this.state.user = null;
    localStorage.removeItem('fash_token');
    localStorage.removeItem('fash_user');
    this.showToast('Logged out successfully.');
    window.location.href = '/';
  },

  async register(name, email, password, phone) {
    return await this.apiCall('/auth/register', 'POST', { name, email, password, phone });
  },

  // Cart Management
  addToCart(product, variant, quantity = 1) {
    const existingIndex = this.state.cart.findIndex(
      item => item.product_id === product.id && item.variant_id === variant.id
    );

    if (existingIndex !== -1) {
      this.state.cart[existingIndex].quantity += parseInt(quantity);
    } else {
      this.state.cart.push({
        id: Date.now(), // Local Cart Item ID
        product_id: product.id,
        product_name: product.name,
        image_url: product.image_url,
        price: parseFloat(product.price),
        mrp: parseFloat(product.mrp),
        variant_id: variant.id,
        size: variant.size,
        color: variant.color,
        quantity: parseInt(quantity)
      });
    }

    localStorage.setItem('fash_cart', JSON.stringify(this.state.cart));
    this.updateCartCount();
    this.showToast(`${product.name} added to your bag.`);
    this.renderCartDrawer();
  },

  removeFromCart(itemId) {
    this.state.cart = this.state.cart.filter(item => item.id !== itemId);
    localStorage.setItem('fash_cart', JSON.stringify(this.state.cart));
    this.updateCartCount();
    this.showToast('Item removed from your bag.');
    this.renderCartDrawer();
  },

  updateCartQty(itemId, newQty) {
    const item = this.state.cart.find(i => i.id === itemId);
    if (item) {
      item.quantity = parseInt(newQty);
      localStorage.setItem('fash_cart', JSON.stringify(this.state.cart));
      this.updateCartCount();
      this.renderCartDrawer();
    }
  },

  clearCart() {
    this.state.cart = [];
    localStorage.removeItem('fash_cart');
    this.updateCartCount();
  },

  getCartSubtotal() {
    return this.state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  updateCartCount() {
    const count = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = count;
  },

  // Wishlist Management
  toggleWishlist(product) {
    const idx = this.state.wishlist.findIndex(item => item.id === product.id);
    if (idx !== -1) {
      this.state.wishlist.splice(idx, 1);
      this.showToast('Removed from Wishlist.');
    } else {
      this.state.wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url
      });
      this.showToast('Added to Wishlist.');
    }
    localStorage.setItem('fash_wishlist', JSON.stringify(this.state.wishlist));
    this.updateWishlistCount();
    
    // Toggle active state of heart icons on page if they exist
    document.querySelectorAll(`.wishlist-heart-btn[data-id="${product.id}"]`).forEach(btn => {
      btn.classList.toggle('active');
    });
  },

  updateWishlistCount() {
    const count = this.state.wishlist.length;
    const badge = document.getElementById('wishlist-count');
    if (badge) badge.innerText = count;
  },

  // Helpers
  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  renderCartDrawer() {
    const itemsContainer = document.getElementById('cart-drawer-items');
    if (!itemsContainer) return;

    itemsContainer.innerHTML = '';
    
    if (this.state.cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="text-center py-5">
          <i class="fa-solid fa-bag-shopping font-size-lg text-muted mb-3" style="font-size: 2.5rem; color: #ccc;"></i>
          <p>Your bag is empty.</p>
          <a href="/shop" class="btn btn-outline mt-3">SHOP NOW</a>
        </div>
      `;
      document.getElementById('cart-drawer-subtotal').innerText = '₹0.00';
      return;
    }

    this.state.cart.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-drawer-item';
      itemEl.style.display = 'flex';
      itemEl.style.gap = '1rem';
      itemEl.style.marginBottom = '1.2rem';
      itemEl.style.paddingBottom = '1.2rem';
      itemEl.style.borderBottom = '1px solid #f1efea';
      itemEl.innerHTML = `
        <img src="${item.image_url || 'https://placehold.co/80x100?text=No+Image'}" onerror="this.src='https://placehold.co/80x100?text=No+Image'" alt="${item.product_name}" style="width: 80px; height: 100px; object-fit: cover;">
        <div style="flex: 1;">
          <h4 style="font-family: inherit; font-size: 0.9rem; margin-bottom: 0.2rem;">${item.product_name}</h4>
          <p style="font-size: 0.75rem; color: #767676;">Size: ${item.size} | Color: ${item.color}</p>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.4rem;">
            <button class="qty-btn" onclick="store.updateCartQty(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''} style="border: 1px solid #ccc; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem;">-</button>
            <span style="font-size: 0.85rem; width: 20px; text-align: center;">${item.quantity}</span>
            <button class="qty-btn" onclick="store.updateCartQty(${item.id}, ${item.quantity + 1})" style="border: 1px solid #ccc; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem;">+</button>
          </div>
        </div>
        <div style="text-align: right;">
          <p style="font-weight: 600; color: var(--color-primary);">₹${item.price * item.quantity}</p>
          <button onclick="store.removeFromCart(${item.id})" style="color: #767676; font-size: 0.8rem; margin-top: 0.8rem;"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      `;
      itemsContainer.appendChild(itemEl);
    });

    const sub = this.getCartSubtotal();
    document.getElementById('cart-drawer-subtotal').innerText = `₹${sub}`;

    // Update Progress bar for shipping
    const limit = parseFloat(this.state.settings.free_shipping_threshold || 3999);
    const progressFill = document.getElementById('progress-bar-fill');
    const progressMsg = document.getElementById('free-shipping-message');
    if (progressFill && progressMsg) {
      if (sub >= limit) {
        progressFill.style.width = '100%';
        progressMsg.innerText = 'CONGRATULATIONS! YOU UNLOCKED FREE SHIPPING.';
      } else {
        const perc = (sub / limit) * 100;
        progressFill.style.width = `${perc}%`;
        progressMsg.innerText = `ADD ₹${limit - sub} MORE TO UNLOCK FREE SHIPPING.`;
      }
    }
  }
};
