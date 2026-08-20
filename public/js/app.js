// SPA Router and Event Orchestrator for Fashnora

const router = {
  routes: {},

  addRoute(path, handler) {
    this.routes[path] = handler;
  },

  async navigate(path) {
    window.history.pushState({}, '', path);
    await this.resolveRoute();
  },

  async resolveRoute() {
    const url = new URL(window.location.href);
    let path = url.pathname;
    
    // Exact match or parameterized match
    let handler = this.routes[path];
    let params = {};

    // Match parameterized route like /product/:slug
    if (!handler) {
      for (const routePath in this.routes) {
        if (routePath.includes('/:')) {
          const base = routePath.split('/:')[0];
          if (path.startsWith(base + '/')) {
            const paramName = routePath.split('/:')[1];
            params[paramName] = path.substring(base.length + 1);
            handler = this.routes[routePath];
            break;
          }
        }
      }
    }

    const appContainer = document.getElementById('app');
    if (!appContainer) return;

    if (handler) {
      // Toggle body class if routing to admin panel
      if (path.startsWith('/admin')) {
        document.body.classList.add('admin-mode');
        document.getElementById('main-header').style.display = 'none';
        document.getElementById('announcement-bar').style.display = 'none';
        document.querySelector('.footer').style.display = 'none';
        if (document.getElementById('mobile-sticky-nav')) {
          document.getElementById('mobile-sticky-nav').style.display = 'none';
        }
      } else {
        document.body.classList.remove('admin-mode');
        document.getElementById('main-header').style.display = 'block';
        document.getElementById('announcement-bar').style.display = 'block';
        document.querySelector('.footer').style.display = 'block';
        if (document.getElementById('mobile-sticky-nav')) {
          document.getElementById('mobile-sticky-nav').style.display = 'flex';
        }
      }

      await handler(params, url.searchParams);
    } else {
      // 404 Route Not Found
      appContainer.innerHTML = `
        <div class="container text-center py-5" style="margin: 5rem auto;">
          <h1 class="font-serif" style="font-size: 3rem; color: var(--color-primary);">404</h1>
          <p class="mt-2">The collection you are searching for does not exist or has moved.</p>
          <a href="/" class="btn btn-primary mt-4" onclick="router.navigate('/'); return false;">RETURN TO HOME</a>
        </div>
      `;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Initialize Application once DOM loads
window.addEventListener('DOMContentLoaded', async () => {
  // Initialize Global Store State
  await store.init();

  // Define storefront routes
  router.addRoute('/', () => pages.Home());
  router.addRoute('/women', (p, q) => pages.Shop('women', q));
  router.addRoute('/kids', (p, q) => pages.Shop('kids', q));
  router.addRoute('/shop', (p, q) => pages.Shop('all', q));
  router.addRoute('/product/:slug', (params) => pages.ProductDetails(params.slug));
  router.addRoute('/cart', () => pages.Cart());
  router.addRoute('/checkout', () => pages.Checkout());
  router.addRoute('/wishlist', () => pages.Wishlist());
  router.addRoute('/account', () => pages.Account());
  router.addRoute('/track-order', () => pages.TrackOrder());
  router.addRoute('/contact', () => pages.Contact());
  router.addRoute('/faq', () => pages.FAQ());
  router.addRoute('/shipping-policy', () => pages.ShippingPolicy());
  router.addRoute('/returns-refunds', () => pages.ReturnsRefunds());
  
  // Define admin routes
  router.addRoute('/admin', () => admin.Dashboard());
  router.addRoute('/admin/products', () => admin.Products());
  router.addRoute('/admin/orders', () => admin.Orders());
  router.addRoute('/admin/returns', () => admin.Returns());
  router.addRoute('/admin/coupons', () => admin.Coupons());
  router.addRoute('/admin/settings', () => admin.Settings());

  // Listen to popstate (back/forward browser clicks)
  window.addEventListener('popstate', () => router.resolveRoute());

  // Intercept all clicks on internal routing anchors
  document.body.addEventListener('click', e => {
    const anchor = e.target.closest('a');
    if (anchor && anchor.getAttribute('href') && anchor.getAttribute('href').startsWith('/') && !anchor.getAttribute('target')) {
      e.preventDefault();
      
      // Close drawers on navigate
      document.getElementById('cart-drawer')?.classList.remove('active');
      document.getElementById('cart-drawer-overlay')?.classList.remove('active');
      document.getElementById('mobile-menu-drawer')?.classList.remove('active');
      
      router.navigate(anchor.getAttribute('href'));
    }
  });

  // Setup Event Listeners for Drawers & Modals
  setupDrawerListeners();

  // Setup Live Search auto-suggestions
  setupSearchAutocomplete();

  // Resolve Initial Route
  await router.resolveRoute();
});

// Setup drawer sliding logic
function setupDrawerListeners() {
  const cartBtn = document.getElementById('cart-btn');
  const mobCartBtn = document.getElementById('mobile-cart-toggle');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');

  const openCart = () => {
    cartDrawer.classList.add('active');
    overlay.classList.add('active');
    store.renderCartDrawer();
  };

  const closeCart = () => {
    cartDrawer.classList.remove('active');
    overlay.classList.remove('active');
  };

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (mobCartBtn) mobCartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);

  // Mobile hamburger menu slide out
  const mobMenuBtn = document.getElementById('mobile-menu-btn');
  const closeMenuBtn = document.getElementById('close-menu-btn');
  const menuDrawer = document.getElementById('mobile-menu-drawer');

  if (mobMenuBtn && menuDrawer) {
    mobMenuBtn.addEventListener('click', () => menuDrawer.classList.add('active'));
  }
  if (closeMenuBtn && menuDrawer) {
    closeMenuBtn.addEventListener('click', () => menuDrawer.classList.remove('active'));
  }

  // Mobile menu dropdown expanders
  document.querySelectorAll('.dropdown-header').forEach(header => {
    header.addEventListener('click', () => {
      const parent = header.parentElement;
      parent.classList.toggle('active');
    });
  });

  // Modal Closures
  const closeQuickview = document.getElementById('close-quickview-btn');
  if (closeQuickview) {
    closeQuickview.addEventListener('click', () => {
      document.getElementById('quickview-modal').classList.add('hidden');
    });
  }

  const closeSizeChart = document.getElementById('close-size-chart-btn');
  if (closeSizeChart) {
    closeSizeChart.addEventListener('click', () => {
      document.getElementById('size-chart-modal').classList.add('hidden');
    });
  }
}

// Live search auto-suggestions
function setupSearchAutocomplete() {
  const desktopInput = document.getElementById('desktop-search-input');
  const suggestionsBox = document.getElementById('search-suggestions');

  if (desktopInput && suggestionsBox) {
    desktopInput.addEventListener('input', debounce(async (e) => {
      const q = e.target.value.trim();
      if (q.length < 2) {
        suggestionsBox.classList.add('hidden');
        return;
      }

      try {
        const products = await store.apiCall(`/products?search=${q}`);
        suggestionsBox.innerHTML = '';
        if (products.length === 0) {
          suggestionsBox.innerHTML = `<div style="padding: 1rem; font-size: 0.85rem; color:#767676;">No matches found</div>`;
        } else {
          // List suggestions
          products.slice(0, 5).forEach(prod => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.style.display = 'flex';
            item.style.gap = '0.5rem';
            item.style.padding = '0.5rem 1rem';
            item.style.cursor = 'pointer';
            item.style.borderBottom = '1px solid #f1efea';
            item.innerHTML = `
              <img src="${prod.image_url}" style="width: 30px; height: 40px; object-fit: cover;">
              <div style="flex:1; overflow:hidden;">
                <p style="font-size:0.85rem; text-overflow:ellipsis; white-space:nowrap; overflow:hidden;">${prod.name}</p>
                <p style="font-size:0.75rem; font-weight:600; color:var(--color-primary);">₹${prod.price}</p>
              </div>
            `;
            item.onclick = () => {
              suggestionsBox.classList.add('hidden');
              desktopInput.value = '';
              router.navigate(`/product/${prod.slug}`);
            };
            suggestionsBox.appendChild(item);
          });
        }
        suggestionsBox.classList.remove('hidden');
      } catch (err) {
        console.error(err);
      }
    }, 300));

    // Close recommendations box on click away
    document.addEventListener('click', e => {
      if (!desktopInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.classList.add('hidden');
      }
    });

    // Handle Enter press
    desktopInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        const q = desktopInput.value.trim();
        if (q) {
          desktopInput.value = '';
          suggestionsBox.classList.add('hidden');
          router.navigate(`/shop?search=${q}`);
        }
      }
    });
  }
}

// Utility debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
