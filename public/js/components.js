// Common Frontend UI Components for Fashnora

const components = {
  // 1. Premium Product Card Component
  ProductCard(product) {
    const isWishlisted = store.state.wishlist.some(item => item.id === product.id);
    const hasDiscount = product.discount > 0;
    const isOutOfStock = product.stock_quantity <= 0;
    
    // Determine badges
    let badgeHtml = '';
    if (isOutOfStock) {
      badgeHtml = `<span class="badge-tag" style="background-color:#767676;">Out Of Stock</span>`;
    } else {
      if (product.is_bestseller) badgeHtml += `<span class="badge-tag badge-bestseller">BESTSELLER</span>`;
      if (product.is_new_arrival) badgeHtml += `<span class="badge-tag badge-new">NEW</span>`;
      if (product.is_sale) badgeHtml += `<span class="badge-tag badge-sale">SALE</span>`;
    }

    return `
      <div class="product-card" data-slug="${product.slug}">
        <div class="product-image-wrapper">
          <div class="card-badges">${badgeHtml}</div>
          <button class="wishlist-heart-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" onclick="event.stopPropagation(); event.preventDefault(); components.handleWishlistToggle(${product.id})">
            <i class="fa-solid fa-heart"></i>
          </button>
          
          <a href="/product/${product.slug}" onclick="router.navigate('/product/${product.slug}'); return false;">
            <img src="${product.image_url}" alt="${product.name}" class="primary-img">
            <img src="${product.images && product.images[1] ? product.images[1] : product.image_url}" alt="${product.name} hover" class="hover-img">
          </a>
          
          <button class="quick-view-bar" onclick="event.stopPropagation(); components.openQuickView('${product.slug}')">
            Quick View
          </button>
        </div>
        
        <div class="product-card-details">
          <span class="card-category">${product.category_name || 'Collection'}</span>
          <h3 class="card-title"><a href="/product/${product.slug}" onclick="router.navigate('/product/${product.slug}'); return false;">${product.name}</a></h3>
          
          <div class="card-price-row">
            <span class="price-selling">₹${product.price}</span>
            ${hasDiscount ? `<span class="price-mrp">₹${product.mrp}</span><span class="price-discount">${product.discount}% OFF</span>` : ''}
          </div>
          
          <div style="font-size: 0.75rem; color: #767676; margin-top: 0.5rem; display: flex; justify-content: space-between;">
            <span>${product.fabric ? `Fabric: ${product.fabric}` : ''}</span>
            ${product.stock_quantity <= 3 && product.stock_quantity > 0 ? `<span style="color: var(--color-primary); font-weight:600;">Only ${product.stock_quantity} left</span>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  // Event handlers for inline events
  async handleWishlistToggle(productId) {
    try {
      const products = await store.apiCall('/products');
      const prod = products.find(p => p.id === productId);
      if (prod) {
        store.toggleWishlist(prod);
      }
    } catch (e) {
      console.error(e);
    }
  },

  // 2. Quick View Modal Builder
  async openQuickView(slug) {
    const modal = document.getElementById('quickview-modal');
    const content = document.getElementById('quickview-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `<div class="text-center py-5" style="grid-column: span 2;"><div class="spinner"></div></div>`;
    modal.classList.remove('hidden');

    try {
      const product = await store.apiCall(`/products/slug/${slug}`);
      if (!product) return;

      const hasDiscount = product.discount > 0;
      const variants = product.variants || [];
      const colors = [...new Set(variants.map(v => v.color))];
      const sizes = [...new Set(variants.map(v => v.size))];

      let sizeOptions = sizes.map(s => `<option value="${s}">${s}</option>`).join('');
      let colorOptions = colors.map(c => `<option value="${c}">${c}</option>`).join('');

      content.innerHTML = `
        <div class="quickview-gallery" style="display:flex; flex-direction:column; gap: 1rem;">
          <img src="${product.image_url}" id="qv-main-image" style="width: 100%; height: 400px; object-fit: cover; border-radius: 4px;">
          <div class="qv-thumbnails" style="display:flex; gap:0.5rem; overflow-x:auto;">
            ${(product.images || []).map(img => `
              <img src="${img}" onclick="document.getElementById('qv-main-image').src='${img}'" style="width: 60px; height: 80px; object-fit:cover; cursor:pointer; border: 1px solid #ccc; border-radius: 2px;">
            `).join('')}
          </div>
        </div>
        <div class="quickview-details" style="display:flex; flex-direction:column; justify-content:center;">
          <h2 class="font-serif" style="font-size: 1.5rem; margin-bottom: 0.5rem;">${product.name}</h2>
          <div style="display:flex; gap:0.8rem; align-items:center; margin-bottom: 1rem;">
            <span style="font-size: 1.25rem; font-weight:700; color:var(--color-primary);">₹${product.price}</span>
            ${hasDiscount ? `<span style="text-decoration:line-through; color:#767676;">₹${product.mrp}</span><span style="color:var(--color-accent); font-weight:600;">${product.discount}% OFF</span>` : ''}
          </div>
          <p style="font-size:0.85rem; color:#767676; margin-bottom: 1.5rem;">${product.description}</p>
          
          <div class="admin-form-group">
            <label class="admin-form-label">Color</label>
            <select id="qv-color" class="admin-form-select">${colorOptions}</select>
          </div>
          <div class="admin-form-group">
            <label class="admin-form-label">Size</label>
            <select id="qv-size" class="admin-form-select">${sizeOptions}</select>
          </div>

          <button id="qv-add-btn" class="btn btn-primary btn-block mt-3">ADD TO BAG</button>
        </div>
      `;

      document.getElementById('qv-add-btn').onclick = () => {
        const selectedColor = document.getElementById('qv-color').value;
        const selectedSize = document.getElementById('qv-size').value;
        const matchedVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize);
        
        if (matchedVariant) {
          store.addToCart(product, matchedVariant, 1);
          modal.classList.add('hidden');
        } else {
          store.showToast('Selected variant is out of stock.');
        }
      };

    } catch (err) {
      console.error(err);
      content.innerHTML = `<p class="text-center py-5" style="grid-column: span 2;">Failed to load product details.</p>`;
    }
  }
};
