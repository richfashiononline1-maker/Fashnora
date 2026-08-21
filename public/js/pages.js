// Storefront Pages Rendering Engine for Fashnora

const pages = {
  // 1. Home Page View
  async Home() {
    const app = document.getElementById('app');
    
    // Fetch products for New Arrivals & Bestsellers
    let products = [];
    try {
      products = await store.apiCall('/products');
    } catch (err) {
      console.error(err);
    }

    const newArrivals = products.filter(p => p.is_new_arrival).slice(0, 4);
    const bestSellers = products.filter(p => p.is_bestseller).slice(0, 4);

    const heroBanner = store.state.banners.find(b => b.section === 'hero') || {
      title: 'STYLE THAT FEELS LIKE YOU.',
      subtitle: 'Discover contemporary women\'s and kids\' fashion designed for every celebration, mood and moment.',
      image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1600&q=80'
    };

    app.innerHTML = `
      <!-- Hero Campaign -->
      <section class="hero-section">
        <img class="hero-bg" src="${heroBanner.image_url}" alt="Campaign Image">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1 class="hero-title">${heroBanner.title}</h1>
          <p class="hero-subtitle">${heroBanner.subtitle}</p>
          <div class="hero-buttons">
            <a href="/women" class="btn btn-primary">SHOP WOMEN</a>
            <a href="/kids" class="btn btn-outline">SHOP KIDS</a>
          </div>
        </div>
      </section>

      <!-- Shop by Category -->
      <section class="category-section container">
        <h2 class="section-title">Shop By Category</h2>
        <div class="category-grid">
          <div class="category-card" onclick="router.navigate('/women?subcategory=women-cord-sets')">
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80" alt="Women Cord Sets">
            <div class="category-info">
              <h3>Women's Co-ord Sets</h3>
              <span class="btn-text">EXPLORE &rarr;</span>
            </div>
          </div>
          <div class="category-card" onclick="router.navigate('/women?subcategory=women-sarees')">
            <img src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80" alt="Women Sarees">
            <div class="category-info">
              <h3>Designer Sarees</h3>
              <span class="btn-text">EXPLORE &rarr;</span>
            </div>
          </div>
          <div class="category-card" onclick="router.navigate('/kids')">
            <img src="https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80" alt="Kids Edit">
            <div class="category-info">
              <h3>Kids Festive Wear</h3>
              <span class="btn-text">EXPLORE &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      <!-- New Arrivals Grid -->
      <section class="container py-5" style="border-top: 1px solid #f1efea;">
        <h2 class="section-title">New Arrivals</h2>
        <div class="product-grid">
          ${newArrivals.map(prod => components.ProductCard(prod)).join('')}
        </div>
        <div class="text-center mt-4" style="margin-bottom: 5rem;">
          <a href="/shop?isNewArrival=true" class="btn btn-outline">VIEW ALL NEW ARRIVALS</a>
        </div>
      </section>

      <!-- Editorial Campaign: Saree Edit -->
      <section class="py-5" style="background-color: var(--color-primary); color: var(--color-bg-base); position:relative; overflow:hidden;">
        <div class="container" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem; align-items:center;">
          <div>
            <span style="font-size:0.75rem; letter-spacing:0.2em; text-transform:uppercase;">Traditional Splendor</span>
            <h2 class="font-serif mt-2" style="font-size:2.8rem; line-height:1.2; color: var(--color-accent);">THE SAREE EDIT</h2>
            <p class="mt-3" style="font-size:0.95rem; opacity:0.85; max-width:450px;">Handpicked traditional prints, premium georgette drapes, and lightweight cotton weaves designed to bring timeless Indian heritage into modern celebrations.</p>
            <a href="/women?subcategory=women-sarees" class="btn btn-outline mt-4" style="border-color: var(--color-accent); color: var(--color-accent);">EXPLORE SAREES</a>
          </div>
          <div style="height:350px; overflow:hidden; border-radius:4px;">
            <img src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80" style="width:100%; height:100%; object-fit:cover;">
          </div>
        </div>
      </section>

      <!-- Best Sellers Section -->
      <section class="container py-5">
        <h2 class="section-title">Bestselling Pieces</h2>
        <div class="product-grid">
          ${bestSellers.map(prod => components.ProductCard(prod)).join('')}
        </div>
      </section>

      <!-- Interactive Style Finder Quiz -->
      <section class="container py-5" style="border-top: 1px solid #f1efea; max-width:800px; margin:0 auto; margin-bottom: 6rem;">
        <div class="style-finder-card text-center" style="background-color:#fff; padding:3rem; border-radius:8px; box-shadow:var(--shadow-premium);">
          <h2 class="font-serif" style="color:var(--color-primary);">Style Finder Quiz</h2>
          <p class="mt-2 text-muted" style="font-size:0.9rem;">Not sure what to pick? Tell us what you are shopping for, and we will recommend the perfect Fashnora outfits.</p>
          <div id="quiz-options-container" class="mt-4" style="display:flex; justify-content:center; gap: 1rem; flex-wrap:wrap;">
            <button class="btn btn-outline quiz-opt" data-occ="Festive Wear">Festive Party</button>
            <button class="btn btn-outline quiz-opt" data-occ="Wedding Guest">Wedding Guest</button>
            <button class="btn btn-outline quiz-opt" data-occ="Casual Wear">Everyday Style</button>
            <button class="btn btn-outline quiz-opt" data-occ="Party Wear">Evening Gala</button>
          </div>
          <div id="quiz-results" class="mt-4 hidden">
            <h4 style="font-size:1.1rem; color:var(--color-accent);">Recommended for you:</h4>
            <div id="quiz-results-grid" class="product-grid mt-3"></div>
          </div>
        </div>
      </section>

      <!-- Trust Badges -->
      <section class="py-5" style="background-color: var(--color-grey-light);">
        <div class="container" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; text-align:center;">
          <div>
            <i class="fa-solid fa-lock" style="font-size:1.5rem; color:var(--color-primary); margin-bottom: 0.5rem;"></i>
            <h5 style="font-weight:600;">Secure Payments</h5>
            <p style="font-size:0.75rem; color:#767676;">Verified Razorpay & UPI Gateway</p>
          </div>
          <div>
            <i class="fa-solid fa-truck" style="font-size:1.5rem; color:var(--color-primary); margin-bottom: 0.5rem;"></i>
            <h5 style="font-weight:600;">Free Shipping</h5>
            <p style="font-size:0.75rem; color:#767676;">On all orders above ₹999</p>
          </div>
          <div>
            <i class="fa-solid fa-rotate-left" style="font-size:1.5rem; color:var(--color-primary); margin-bottom: 0.5rem;"></i>
            <h5 style="font-weight:600;">7-Day Easy Returns</h5>
            <p style="font-size:0.75rem; color:#767676;">Stress-free exchanges & refunds</p>
          </div>
        </div>
      </section>
    `;

    // Hook Style Finder events
    document.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.onclick = async () => {
        // Toggle active button
        document.querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('active'));
        btn.classList.add('active');

        const occasion = btn.getAttribute('data-occ');
        try {
          const recs = await store.apiCall(`/products/style-finder?occasion=${occasion}`);
          const grid = document.getElementById('quiz-results-grid');
          const resultsBox = document.getElementById('quiz-results');
          
          if (recs && recs.length > 0) {
            grid.innerHTML = recs.map(p => components.ProductCard(p)).join('');
            resultsBox.classList.remove('hidden');
          } else {
            grid.innerHTML = '<p>No matching outfits found in this category.</p>';
            resultsBox.classList.remove('hidden');
          }
        } catch (e) {
          console.error(e);
        }
      };
    });
  },

  // 2. Shop Listing View
  async Shop(gender = 'all', queryParams = new URLSearchParams()) {
    const app = document.getElementById('app');
    
    // Convert current search params to filters
    let search = queryParams.get('search') || '';
    let subcategory = queryParams.get('subcategory') || '';
    let isNewArrival = queryParams.get('isNewArrival') || '';
    let isBestseller = queryParams.get('isBestseller') || '';
    let isSale = queryParams.get('isSale') || '';
    let sort = queryParams.get('sort') || 'featured';

    app.innerHTML = `
      <div class="container py-5">
        <div class="shop-header">
          <h1 class="font-serif" style="text-transform:uppercase; font-size:2rem; color:var(--color-primary);">${gender === 'all' ? 'All collections' : `${gender}'s Edit`}</h1>
          <div>
            <select id="shop-sort" class="admin-form-select" style="width:200px;">
              <option value="featured" ${sort === 'featured' ? 'selected' : ''}>Featured</option>
              <option value="newest" ${sort === 'newest' ? 'selected' : ''}>Newest Arrivals</option>
              <option value="price-low" ${sort === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price-high" ${sort === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
              <option value="bestselling" ${sort === 'bestselling' ? 'selected' : ''}>Bestselling</option>
            </select>
          </div>
        </div>

        <div class="shop-layout">
          
          <!-- Sidebar Filters -->
          <aside class="desktop-only" style="border-right: 1px solid #f1efea; padding-right:1.5rem;">
            <div style="margin-bottom:1.5rem;">
              <h4 style="font-size:0.9rem; text-transform:uppercase; margin-bottom: 0.8rem; font-family:inherit;">Fabric</h4>
              <div style="display:flex; flex-direction:column; gap:0.4rem;">
                <label style="font-size:0.85rem;"><input type="checkbox" class="fabric-filter" value="Georgette"> Georgette</label>
                <label style="font-size:0.85rem;"><input type="checkbox" class="fabric-filter" value="Cotton"> Cotton Lurex</label>
                <label style="font-size:0.85rem;"><input type="checkbox" class="fabric-filter" value="Linen"> Pure Linen</label>
                <label style="font-size:0.85rem;"><input type="checkbox" class="fabric-filter" value="Silk"> Silk Blend</label>
              </div>
            </div>

            <div style="margin-bottom:1.5rem;">
              <h4 style="font-size:0.9rem; text-transform:uppercase; margin-bottom: 0.8rem; font-family:inherit;">Price Range</h4>
              <div style="display:flex; align-items:center; gap: 0.5rem;">
                <input type="number" id="price-min" placeholder="Min" class="admin-form-input" style="padding:0.4rem;">
                <span>-</span>
                <input type="number" id="price-max" placeholder="Max" class="admin-form-input" style="padding:0.4rem;">
              </div>
            </div>

            <button id="apply-filters-btn" class="btn btn-primary btn-block" style="padding:0.5rem 1rem; font-size:0.75rem;">APPLY FILTERS</button>
          </aside>

          <!-- Main Grid -->
          <div>
            <div id="shop-product-grid" class="product-grid" style="padding-top:0;">
              <div class="text-center py-5" style="grid-column: span 3;"><div class="spinner"></div></div>
            </div>
          </div>

        </div>
      </div>
    `;

    // Local Helper to Fetch and render products with active filters
    const loadProducts = async () => {
      const grid = document.getElementById('shop-product-grid');
      let url = `/products?sort=${sort}`;
      if (gender !== 'all') url += `&category=${gender}`;
      if (subcategory) url += `&subcategory=${subcategory}`;
      if (isNewArrival) url += `&isNewArrival=${isNewArrival}`;
      if (isBestseller) url += `&isBestseller=${isBestseller}`;
      if (isSale) url += `&isSale=${isSale}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      // Append fabric & price checks
      const min = document.getElementById('price-min').value;
      const max = document.getElementById('price-max').value;
      if (min) url += `&priceMin=${min}`;
      if (max) url += `&priceMax=${max}`;

      const selectedFabrics = Array.from(document.querySelectorAll('.fabric-filter:checked')).map(el => el.value);
      if (selectedFabrics.length > 0) url += `&fabric=${selectedFabrics.join(',')}`;

      try {
        const products = await store.apiCall(url);
        if (products.length === 0) {
          grid.innerHTML = `<div class="text-center py-5" style="grid-column: span 3;"><p>No products match your criteria. Try adjusting filters.</p></div>`;
        } else {
          grid.innerHTML = products.map(p => components.ProductCard(p)).join('');
        }
      } catch (err) {
        grid.innerHTML = `<div class="text-center py-5" style="grid-column: span 3;"><p>Failed to load catalog products.</p></div>`;
      }
    };

    // Attach filters listener
    document.getElementById('apply-filters-btn').onclick = loadProducts;
    document.getElementById('shop-sort').onchange = (e) => {
      sort = e.target.value;
      loadProducts();
    };

    // Load initial products
    await loadProducts();
  },

  // 3. Product Details View
  async ProductDetails(slug) {
    const app = document.getElementById('app');
    
    app.innerHTML = `<div class="container py-5 text-center"><div class="spinner"></div></div>`;

    try {
      const product = await store.apiCall(`/products/slug/${slug}`);
      if (!product) {
        app.innerHTML = `<div class="container py-5 text-center"><h2>Product not found</h2></div>`;
        return;
      }

      const hasDiscount = product.discount > 0;
      const variants = product.variants || [];
      const colors = [...new Set(variants.map(v => v.color))];
      const sizes = [...new Set(variants.map(v => v.size))];

      app.innerHTML = `
        <div class="container py-5">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem;">
            
            <!-- Gallery -->
            <div style="display:flex; flex-direction:column; gap:1rem;">
              <div style="position:relative; overflow:hidden; border-radius:4px; height:500px;">
                <img id="main-product-image" src="${product.image_url}" style="width:100%; height:100%; object-fit:cover;">
              </div>
              <div style="display:flex; gap:0.5rem; overflow-x:auto;">
                ${(product.images || []).map(img => `
                  <img class="thumb-img" src="${img}" style="width: 70px; height: 90px; object-fit:cover; cursor:pointer; border:1px solid #ccc; border-radius:2px;">
                `).join('')}
              </div>
            </div>

            <!-- Product Specs -->
            <div style="display:flex; flex-direction:column; justify-content:center;">
              <span style="font-size:0.75rem; text-transform:uppercase; color:#767676; letter-spacing:0.1em;">${product.category_name || 'Premium Wear'}</span>
              <h1 class="font-serif mt-2" style="font-size:2.2rem; color:var(--color-primary);">${product.name}</h1>
              
              <div style="display:flex; align-items:center; gap: 1rem; margin:1rem 0;">
                <span style="font-size:1.5rem; font-weight:700; color:var(--color-primary);">₹${product.price}</span>
                ${hasDiscount ? `<span style="text-decoration:line-through; color:#767676; font-size:1.1rem;">₹${product.mrp}</span><span style="color:var(--color-accent); font-weight:600;">${product.discount}% OFF</span>` : ''}
              </div>

              <div style="border-top:1px solid #f1efea; border-bottom:1px solid #f1efea; padding:1.2rem 0; margin-bottom:1.5rem;">
                <p style="font-size:0.9rem; color:#767676;">${product.description}</p>
                <div style="margin-top:1rem; font-size:0.85rem; display:grid; grid-template-columns: 1fr 1fr; gap:0.8rem;">
                  <span><strong>Fabric:</strong> ${product.fabric || 'N/A'}</span>
                  <span><strong>Occasion:</strong> ${product.occasion || 'N/A'}</span>
                </div>
              </div>

              <!-- Options Selection -->
              <div class="admin-form-group">
                <label class="admin-form-label">Select Color</label>
                <div style="display:flex; gap:0.5rem;">
                  ${colors.map((c, i) => `
                    <button class="color-swatch-btn ${i === 0 ? 'active' : ''}" data-color="${c}" style="border: 1px solid #ccc; padding: 0.4rem 1rem; font-size:0.8rem; border-radius:2px; background:#fff;">${c}</button>
                  `).join('')}
                </div>
              </div>

              <div class="admin-form-group">
                <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                  <label class="admin-form-label">Select Size</label>
                  <button id="show-size-guide-btn" style="font-size:0.75rem; text-decoration:underline; color:var(--color-accent);">Size Chart</button>
                </div>
                <div style="display:flex; gap:0.5rem; margin-top:0.4rem;">
                  ${sizes.map((s, i) => `
                    <button class="size-swatch-btn ${i === 0 ? 'active' : ''}" data-size="${s}" style="border: 1px solid #ccc; padding: 0.4rem 1rem; font-size:0.8rem; border-radius:2px; background:#fff;">${s}</button>
                  `).join('')}
                </div>
              </div>

              <div style="display:flex; gap:1.5rem; margin-top:1.5rem;">
                <button id="add-to-cart-btn" class="btn btn-primary" style="flex:1;">ADD TO BAG</button>
                <button id="wishlist-detail-btn" class="btn btn-outline" style="width:60px; padding:0; display:flex; align-items:center; justify-content:center;"><i class="fa-regular fa-heart" style="font-size:1.2rem;"></i></button>
              </div>

              <div style="margin-top:2rem; font-size:0.8rem; color:#767676; display:flex; flex-direction:column; gap:0.6rem;">
                <span><i class="fa-solid fa-truck" style="margin-right:0.5rem;"></i> Est Delivery: 3-5 Business Days</span>
                <span><i class="fa-solid fa-rotate" style="margin-right:0.5rem;"></i> Easy returns and exchanges within 7 days</span>
              </div>

            </div>

          </div>

          <!-- Reviews Section -->
          <section style="margin-top:5rem; border-top:1px solid #f1efea; padding-top:3rem;">
            <h2 class="font-serif mb-4" style="font-size:1.8rem; color:var(--color-primary);">Customer Reviews</h2>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:3rem;">
              <div>
                <h4 style="font-family:inherit; margin-bottom: 1rem;">Write a Review</h4>
                <div class="admin-form-group">
                  <label class="admin-form-label">Rating</label>
                  <select id="review-rating" class="admin-form-select">
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                <div class="admin-form-group">
                  <label class="admin-form-label">Review Text</label>
                  <textarea id="review-text" class="admin-form-textarea" rows="4"></textarea>
                </div>
                <button id="submit-review-btn" class="btn btn-primary btn-block">SUBMIT REVIEW</button>
              </div>
              <div>
                <h4 style="font-family:inherit; margin-bottom: 1rem;">Customer Feedback</h4>
                <div id="reviews-list-container">
                  <!-- Reviews populated dynamically -->
                </div>
              </div>
            </div>
          </section>
        </div>
      `;

      // Swatches selection togglers
      const colorBtns = document.querySelectorAll('.color-swatch-btn');
      colorBtns.forEach(btn => {
        btn.onclick = () => {
          colorBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        };
      });

      const sizeBtns = document.querySelectorAll('.size-swatch-btn');
      sizeBtns.forEach(btn => {
        btn.onclick = () => {
          sizeBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        };
      });

      // Thumbnail clicks
      document.querySelectorAll('.thumb-img').forEach(thumb => {
        thumb.onclick = () => {
          document.getElementById('main-product-image').src = thumb.src;
        };
      });

      // Size guide click
      document.getElementById('show-size-guide-btn').onclick = () => {
        document.getElementById('size-chart-modal').classList.remove('hidden');
      };

      // Add to cart click
      document.getElementById('add-to-cart-btn').onclick = () => {
        const activeColor = document.querySelector('.color-swatch-btn.active')?.getAttribute('data-color');
        const activeSize = document.querySelector('.size-swatch-btn.active')?.getAttribute('data-size');
        
        const matchedVariant = variants.find(v => v.color === activeColor && v.size === activeSize);
        if (matchedVariant) {
          store.addToCart(product, matchedVariant, 1);
        } else {
          store.showToast('Selected variant is out of stock.');
        }
      };

      // Wishlist detail click
      document.getElementById('wishlist-detail-btn').onclick = () => {
        store.toggleWishlist(product);
      };

      // Fetch Reviews list
      const loadReviews = async () => {
        const container = document.getElementById('reviews-list-container');
        try {
          const reviews = await store.apiCall(`/reviews/${product.id}`);
          if (reviews.length === 0) {
            container.innerHTML = `<p style="font-size:0.85rem; color:#767676;">No reviews yet. Be the first to share your experience!</p>`;
          } else {
            container.innerHTML = reviews.map(r => `
              <div style="border-bottom:1px solid #f1efea; padding-bottom: 1rem; margin-bottom: 1rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong>${r.user_name}</strong>
                  <span style="color:var(--color-accent);">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                </div>
                ${r.is_verified ? `<span style="font-size:0.65rem; background:#DCFCE7; color:#16A34A; padding:2px 6px; border-radius:1px; font-weight:600; text-transform:uppercase;">Verified Buyer</span>` : ''}
                <p style="font-size:0.85rem; color:#4a4a4a; margin-top:0.4rem;">${r.review_text || ''}</p>
              </div>
            `).join('');
          }
        } catch (e) {
          container.innerHTML = `<p>Failed to load reviews.</p>`;
        }
      };

      // Review submission handler
      document.getElementById('submit-review-btn').onclick = async () => {
        if (!store.state.token) {
          store.showToast('Please login to write a review.');
          router.navigate('/account');
          return;
        }

        const rating = document.getElementById('review-rating').value;
        const text = document.getElementById('review-text').value;

        try {
          await store.apiCall('/reviews', 'POST', {
            product_id: product.id,
            rating,
            review_text: text
          }, true);

          store.showToast('Review submitted. Thank you!');
          document.getElementById('review-text').value = '';
          await loadReviews();
        } catch (err) {
          store.showToast(err.message || 'Failed to submit review.');
        }
      };

      await loadReviews();

    } catch (err) {
      console.error(err);
      app.innerHTML = `<div class="container py-5 text-center"><h2>Failed to load product.</h2></div>`;
    }
  },

  // 4. Full Cart Page View
  Cart() {
    const app = document.getElementById('app');
    
    const renderCartPage = () => {
      const sub = store.getCartSubtotal();
      const limit = parseFloat(store.state.settings.free_shipping_threshold || 3999);
      const shippingCharge = parseFloat(store.state.settings.shipping_charges || 99);
      const shipping = sub >= limit ? 0 : shippingCharge;
      const tax = Math.round(sub * 0.05 * 100) / 100;
      const grandTotal = sub + shipping + tax;

      if (store.state.cart.length === 0) {
        app.innerHTML = `
          <div class="container text-center py-5" style="margin: 5rem auto;">
            <i class="fa-solid fa-bag-shopping" style="font-size:3.5rem; color: #ccc;"></i>
            <h2 class="font-serif mt-3" style="color:var(--color-primary);">Your Bag is Empty</h2>
            <p class="mt-2 text-muted">Fill it with premium drapes, kurti sets and celebration outfits.</p>
            <a href="/shop" class="btn btn-primary mt-4">SHOP LATEST COLLECTION</a>
          </div>
        `;
        return;
      }

      app.innerHTML = `
        <div class="container py-5">
          <h1 class="font-serif mb-4" style="font-size: 2.2rem; color:var(--color-primary);">Shopping Bag</h1>
          
          <div class="cart-layout">
            
            <!-- Items -->
            <div>
              ${store.state.cart.map(item => `
                <div style="display:flex; gap:1.5rem; border-bottom:1px solid #f1efea; padding-bottom:1.5rem; margin-bottom:1.5rem; align-items:center;">
                  <img src="${item.image_url || 'https://placehold.co/100x130?text=No+Image'}" onerror="this.src='https://placehold.co/100x130?text=No+Image'" style="width:100px; height:130px; object-fit:cover; border-radius:2px;">
                  <div style="flex:1;">
                    <h3 class="font-serif" style="font-size:1.15rem;">${item.product_name}</h3>
                    <p style="font-size:0.8rem; color:#767676; margin-top:0.2rem;">Size: ${item.size} | Color: ${item.color}</p>
                    <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.8rem;">
                      <button class="qty-btn" onclick="store.updateCartQty(${item.id}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''} style="border:1px solid #ccc; width:24px; height:24px; display:flex; align-items:center; justify-content:center;">-</button>
                      <span style="font-size:0.9rem; width:24px; text-align:center;">${item.quantity}</span>
                      <button class="qty-btn" onclick="store.updateCartQty(${item.id}, ${item.quantity + 1})" style="border:1px solid #ccc; width:24px; height:24px; display:flex; align-items:center; justify-content:center;">+</button>
                    </div>
                  </div>
                  <div style="text-align:right;">
                    <p style="font-weight:700; color:var(--color-primary); font-size:1.1rem;">₹${item.price * item.quantity}</p>
                    <p style="text-decoration:line-through; font-size:0.85rem; color:#767676;">₹${item.mrp * item.quantity}</p>
                    <button class="mt-4" onclick="store.removeFromCart(${item.id})" style="color:#767676; font-size:0.85rem; background:none; border:none; text-decoration:underline;">Remove</button>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Summary -->
            <div style="background-color:#fff; padding:2rem; border-radius:4px; box-shadow:var(--shadow-premium); height:fit-content;">
              <h3 class="font-serif mb-4" style="color:var(--color-primary);">Order Summary</h3>
              <div style="display:flex; flex-direction:column; gap:0.8rem; font-size:0.9rem; border-bottom:1px solid #f1efea; padding-bottom:1.5rem; margin-bottom:1.5rem;">
                <div style="display:flex; justify-content:space-between;"><span>Bag Subtotal</span><span>₹${sub}</span></div>
                <div style="display:flex; justify-content:space-between;"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                <div style="display:flex; justify-content:space-between;"><span>GST (5%)</span><span>₹${tax}</span></div>
              </div>
              <div style="display:flex; justify-content:space-between; font-weight:700; font-size:1.2rem; margin-bottom:2rem;">
                <span>Total</span>
                <span>₹${grandTotal}</span>
              </div>
              <a href="/checkout" class="btn btn-primary btn-block text-center">PROCEED TO CHECKOUT</a>
            </div>

          </div>
        </div>
      `;
    };

    renderCartPage();

    // Hook store changes to re-render cart page if modified from cart page
    const originalUpdateQty = store.updateCartQty;
    store.updateCartQty = (id, val) => {
      originalUpdateQty.call(store, id, val);
      renderCartPage();
    };

    const originalRemove = store.removeFromCart;
    store.removeFromCart = (id) => {
      originalRemove.call(store, id);
      renderCartPage();
    };
  },

  // 5. Checkout Process View
  Checkout() {
    const app = document.getElementById('app');

    if (store.state.cart.length === 0) {
      router.navigate('/cart');
      return;
    }

    if (!store.state.token) {
      store.showToast('Please login to proceed to checkout.');
      router.navigate('/account');
      return;
    }

    let selectedAddressId = null;
    let couponCode = '';
    let discountAmount = 0;
    let paymentMethod = 'COD'; // Default Cash on Delivery

    const sub = store.getCartSubtotal();
    const threshold = parseFloat(store.state.settings.free_shipping_threshold || 3999);
    const shippingCharge = parseFloat(store.state.settings.shipping_charges || 99);
    const shipping = sub >= threshold ? 0 : shippingCharge;
    const tax = Math.round(sub * 0.05 * 100) / 100;
    
    let grandTotal = sub + shipping + tax;

    const renderCheckout = () => {
      app.innerHTML = `
        <div class="container py-5">
          <h1 class="font-serif mb-4" style="font-size:2rem; color:var(--color-primary);">Secure Checkout</h1>
          
          <div class="checkout-layout">
            
            <div>
              <!-- Address Section -->
              <div style="background:#fff; padding:2rem; border-radius:4px; margin-bottom:2rem; box-shadow:var(--shadow-premium);">
                <h3 class="font-serif mb-3" style="font-size:1.25rem;">1. Shipping Address</h3>
                <div id="checkout-address-list">
                  <p class="text-muted" style="font-size:0.85rem;">Please configure shipping details below</p>
                </div>
                <div class="address-form-grid" id="address-form-container">
                  <input type="text" id="ship-name" placeholder="Full Name" class="admin-form-input">
                  <input type="text" id="ship-phone" placeholder="Phone Number" class="admin-form-input">
                  <input type="text" id="ship-flat" placeholder="Flat / House / Suite" class="admin-form-input full-width">
                  <input type="text" id="ship-city" placeholder="City" class="admin-form-input">
                  <input type="text" id="ship-state" placeholder="State" class="admin-form-input">
                  <input type="text" id="ship-pincode" placeholder="Pincode (6 digits)" class="admin-form-input">
                </div>
              </div>

              <!-- Payment Method Section -->
              <div style="background:#fff; padding:2rem; border-radius:4px; box-shadow:var(--shadow-premium);">
                <h3 class="font-serif mb-3" style="font-size:1.25rem;">2. Payment Method</h3>
                <div style="display:flex; flex-direction:column; gap:0.8rem;">
                  <label style="display:flex; align-items:center; gap: 0.8rem; font-size:0.9rem; padding: 1rem; border:1px solid #f1efea; border-radius:2px; cursor:pointer;">
                    <input type="radio" name="payment_mode" value="COD" checked>
                    <span>Cash on Delivery (COD)</span>
                  </label>
                  <label style="display:flex; align-items:center; gap: 0.8rem; font-size:0.9rem; padding: 1rem; border:1px solid #f1efea; border-radius:2px; cursor:pointer;">
                    <input type="radio" name="payment_mode" value="Razorpay">
                    <span>Razorpay UPI / Card / Netbanking</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Order Review Panel -->
            <div>
              <div style="background:#fff; padding:2rem; border-radius:4px; box-shadow:var(--shadow-premium);">
                <h3 class="font-serif mb-4" style="color:var(--color-primary);">Order Summary</h3>
                
                <div style="display:flex; flex-direction:column; gap:0.8rem; max-height:200px; overflow-y:auto; margin-bottom:1.5rem;">
                  ${store.state.cart.map(item => `
                    <div style="display:flex; gap:0.5rem; justify-content:space-between; font-size:0.85rem;">
                      <span>${item.product_name} (${item.size}) x ${item.quantity}</span>
                      <span>₹${item.price * item.quantity}</span>
                    </div>
                  `).join('')}
                </div>

                <!-- Coupon promo -->
                <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem;">
                  <input type="text" id="coupon-code" placeholder="Coupon Code (e.g. FASH10)" class="admin-form-input" style="padding:0.4rem;">
                  <button id="apply-coupon-btn" class="btn btn-outline" style="padding:0.4rem 1rem;">APPLY</button>
                </div>

                <div style="display:flex; flex-direction:column; gap:0.8rem; font-size:0.9rem; border-top:1px solid #f1efea; padding-top:1.5rem; margin-bottom:1.5rem;">
                  <div style="display:flex; justify-content:space-between;"><span>Subtotal</span><span>₹${sub}</span></div>
                  <div style="display:flex; justify-content:space-between; color:var(--color-accent);"><span>Discount</span><span id="summary-discount">-₹${discountAmount}</span></div>
                  <div style="display:flex; justify-content:space-between;"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                  <div style="display:flex; justify-content:space-between;"><span>GST (5%)</span><span>₹${tax}</span></div>
                </div>

                <div style="display:flex; justify-content:space-between; font-weight:700; font-size:1.2rem; margin-bottom:2rem;">
                  <span>Total</span>
                  <span id="summary-grandtotal">₹${grandTotal}</span>
                </div>

                <button id="place-order-btn" class="btn btn-primary btn-block">PLACE ORDER</button>
              </div>
            </div>

          </div>
        </div>
      `;

      // Event handlers inside template creation scope
      const applyBtn = document.getElementById('apply-coupon-btn');
      if (applyBtn) {
        applyBtn.onclick = async () => {
          const code = document.getElementById('coupon-code').value.trim();
          if (!code) return;
          try {
            const res = await store.apiCall(`/coupons?code=${code}`);
            if (res && res.length > 0) {
              const cp = res[0];
              if (sub >= parseFloat(cp.min_order_amount)) {
                if (cp.type === 'percentage') {
                  discountAmount = (sub * parseFloat(cp.discount_value)) / 100;
                  if (cp.max_discount_amount) discountAmount = Math.min(discountAmount, parseFloat(cp.max_discount_amount));
                } else {
                  discountAmount = parseFloat(cp.discount_value);
                }
                grandTotal = sub - discountAmount + shipping + tax;
                couponCode = cp.code;
                
                document.getElementById('summary-discount').innerText = `-₹${discountAmount}`;
                document.getElementById('summary-grandtotal').innerText = `₹${grandTotal}`;
                store.showToast(`Coupon ${cp.code} applied successfully!`);
              }
            } else {
              store.showToast('Invalid coupon code.');
            }
          } catch (e) {
            store.showToast('Failed to validate coupon.');
          }
        };
      }

      const radioModes = document.getElementsByName('payment_mode');
      radioModes.forEach(r => {
        r.onchange = (e) => {
          paymentMethod = e.target.value;
        };
      });

      const placeOrderBtn = document.getElementById('place-order-btn');
      if (placeOrderBtn) {
        placeOrderBtn.onclick = async () => {
          // Validate Address Form inputs
          const name = document.getElementById('ship-name').value.trim();
          const phone = document.getElementById('ship-phone').value.trim();
          const flat = document.getElementById('ship-flat').value.trim();
          const city = document.getElementById('ship-city').value.trim();
          const state = document.getElementById('ship-state').value.trim();
          const pincode = document.getElementById('ship-pincode').value.trim();

          if (!name || !phone || !flat || !city || !state || !pincode) {
            store.showToast('Please fill in all shipping details.');
            return;
          }

          if (phone.length < 10 || pincode.length !== 6) {
            store.showToast('Please input valid phone and pincode.');
            return;
          }

          placeOrderBtn.innerText = 'PROCESSING ORDER...';
          placeOrderBtn.disabled = true;

          try {
            // Save address first
            const mock = store.state.user.id;
            
            // Place backend order
            const orderRes = await store.apiCall('/orders', 'POST', {
              items: store.state.cart.map(item => ({
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity
              })),
              address: {
                name, phone, flat, city, state, pincode
              },
              coupon_code: couponCode,
              payment_method: paymentMethod
            }, true);

            if (orderRes.success) {
              if (paymentMethod === 'Razorpay') {
                if (orderRes.simulated || !orderRes.razorpay_key_id) {
                  store.clearCart();
                  store.showToast('Test Mode: Simulated Razorpay Payment Successful.');
                  router.navigate(`/track-order?num=${orderRes.order_number}`);
                  return;
                }

                // Initialize Razorpay payment overlay
                const options = {
                  key: orderRes.razorpay_key_id,
                  amount: Math.round(orderRes.grand_total * 100),
                  currency: 'INR',
                  name: 'FASHNORA',
                  description: 'Premium Women & Kids Wear Order',
                  order_id: orderRes.razorpay_order_id,
                  handler: async function (response) {
                    // Call backend verification
                    try {
                      const verifyRes = await store.apiCall('/orders/verify', 'POST', {
                        order_number: orderRes.order_number,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                      }, true);

                      if (verifyRes.success) {
                        store.clearCart();
                        store.showToast('Payment successful! Order placed.');
                        router.navigate(`/track-order?num=${orderRes.order_number}`);
                      }
                    } catch (e) {
                      store.showToast('Payment verification failed.');
                      placeOrderBtn.innerText = 'PLACE ORDER';
                      placeOrderBtn.disabled = false;
                    }
                  },
                  prefill: {
                    name: name,
                    contact: phone,
                    email: store.state.user.email
                  },
                  theme: { color: '#5A1A22' }
                };

                // Trigger modal
                const rzp = new window.Razorpay(options);
                rzp.open();
              } else {
                // COD Flow completes immediately
                store.clearCart();
                store.showToast('Order placed successfully.');
                router.navigate(`/track-order?num=${orderRes.order_number}`);
              }
            }
          } catch (err) {
            store.showToast(err.message || 'Failed to place order.');
            placeOrderBtn.innerText = 'PLACE ORDER';
            placeOrderBtn.disabled = false;
          }
        };
      }
    };

    renderCheckout();
  },

  // 6. User Account Dashboard
  Account() {
    const app = document.getElementById('app');

    const renderLoginForm = () => {
      app.innerHTML = `
        <div class="container py-5" style="max-width:480px; margin: 4rem auto;">
          <div style="background:#fff; padding:3rem; border-radius:4px; box-shadow:var(--shadow-premium);">
            <h2 class="font-serif text-center" style="color:var(--color-primary);">Welcome to Fashnora</h2>
            <p class="text-muted text-center" style="font-size:0.85rem; margin-bottom: 2rem;">Log in to access your bag, orders, and preferences</p>
            
            <div class="admin-form-group">
              <label class="admin-form-label">Email Address</label>
              <input type="email" id="login-email" class="admin-form-input">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Password</label>
              <input type="password" id="login-pass" class="admin-form-input">
            </div>
            <button id="login-submit-btn" class="btn btn-primary btn-block mt-4">LOG IN</button>
            <p style="font-size:0.8rem; text-align:center; margin-top:1.5rem;">
              New customer? <a href="#" id="toggle-register" style="color:var(--color-primary); text-decoration:underline;">Create an account</a>
            </p>
          </div>
        </div>
      `;

      document.getElementById('toggle-register').onclick = (e) => {
        e.preventDefault();
        renderRegisterForm();
      };

      document.getElementById('login-submit-btn').onclick = async () => {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;

        if (!email || !pass) {
          store.showToast('Please fill all fields.');
          return;
        }

        try {
          const user = await store.login(email, pass);
          if (user.role === 'admin' || user.role === 'superadmin') {
            router.navigate('/admin');
          } else {
            router.navigate('/account');
          }
        } catch (err) {
          store.showToast(err.message || 'Login failed.');
        }
      };
    };

    const renderRegisterForm = () => {
      app.innerHTML = `
        <div class="container py-5" style="max-width:480px; margin: 3rem auto;">
          <div style="background:#fff; padding:3rem; border-radius:4px; box-shadow:var(--shadow-premium);">
            <h2 class="font-serif text-center" style="color:var(--color-primary);">Create Account</h2>
            <p class="text-muted text-center" style="font-size:0.85rem; margin-bottom: 2rem;">Join the Fashnora family</p>
            
            <div class="admin-form-group">
              <label class="admin-form-label">Full Name</label>
              <input type="text" id="reg-name" class="admin-form-input">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Email Address</label>
              <input type="email" id="reg-email" class="admin-form-input">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Phone Number (optional)</label>
              <input type="text" id="reg-phone" class="admin-form-input">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Password</label>
              <input type="password" id="reg-pass" class="admin-form-input">
            </div>
            <button id="reg-submit-btn" class="btn btn-primary btn-block mt-4">REGISTER</button>
            <p style="font-size:0.8rem; text-align:center; margin-top:1.5rem;">
              Already have an account? <a href="#" id="toggle-login" style="color:var(--color-primary); text-decoration:underline;">Log in</a>
            </p>
          </div>
        </div>
      `;

      document.getElementById('toggle-login').onclick = (e) => {
        e.preventDefault();
        renderLoginForm();
      };

      document.getElementById('reg-submit-btn').onclick = async () => {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const pass = document.getElementById('reg-pass').value;

        if (!name || !email || !pass) {
          store.showToast('Please fill all required fields.');
          return;
        }

        try {
          await store.register(name, email, pass, phone);
          store.showToast('Registration successful! Please log in.');
          renderLoginForm();
        } catch (err) {
          store.showToast(err.message || 'Registration failed.');
        }
      };
    };

    const renderDashboard = async () => {
      app.innerHTML = `
        <div class="container py-5">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
            <h1 class="font-serif" style="font-size: 2rem; color:var(--color-primary);">My Account</h1>
            <button class="btn btn-outline" onclick="store.logout()" style="padding: 0.5rem 1.5rem; font-size:0.8rem;">LOG OUT</button>
          </div>

          <div style="display:grid; grid-template-columns: 280px 1fr; gap:3rem;">
            
            <aside style="border-right:1px solid #f1efea; padding-right:2rem; font-size:0.9rem;">
              <p style="margin-bottom:0.5rem;"><strong>Name:</strong> ${store.state.user.name}</p>
              <p style="margin-bottom:0.5rem;"><strong>Email:</strong> ${store.state.user.email}</p>
              ${store.state.user.phone ? `<p style="margin-bottom:0.5rem;"><strong>Phone:</strong> ${store.state.user.phone}</p>` : ''}
            </aside>

            <div>
              <h3 class="font-serif mb-3" style="font-size:1.3rem;">Order History</h3>
              <div id="account-orders-list">
                <div class="spinner"></div>
              </div>
            </div>

          </div>
        </div>
      `;

      // Load client orders
      try {
        const orders = await store.apiCall('/orders/my-orders', 'GET', null, true);
        const container = document.getElementById('account-orders-list');
        if (orders.length === 0) {
          container.innerHTML = `<p class="text-muted">You haven't placed any orders yet.</p>`;
        } else {
          container.innerHTML = `
            <table class="admin-table">
              <thead><tr><th>Order #</th><th>Date</th><th>Grand Total</th><th>Status</th><th>Track</th></tr></thead>
              <tbody>
                ${orders.map(o => `
                  <tr>
                    <td>${o.order_number}</td>
                    <td>${new Date(o.created_at).toLocaleDateString()}</td>
                    <td>₹${o.grand_total}</td>
                    <td><span class="status-badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
                    <td><a href="/track-order?num=${o.order_number}" class="btn-text" style="color:var(--color-accent);">Track &rarr;</a></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }
      } catch (err) {
        document.getElementById('account-orders-list').innerHTML = `<p>Failed to load orders.</p>`;
      }
    };

    if (store.state.token) {
      renderDashboard();
    } else {
      renderLoginForm();
    }
  },

  // 7. Track Order Shipment View
  async TrackOrder() {
    const app = document.getElementById('app');
    const urlParams = new URLSearchParams(window.location.search);
    const orderNum = urlParams.get('num');

    if (!orderNum) {
      app.innerHTML = `
        <div class="container py-5 text-center" style="max-width:480px; margin:4rem auto;">
          <h2 class="font-serif">Track Order</h2>
          <p class="text-muted mt-2">Enter your Fashnora Order Number to check delivery status.</p>
          <div class="admin-form-group mt-4">
            <input type="text" id="track-input" placeholder="FN-XXXXXXXXXXXXXXXX" class="admin-form-input">
          </div>
          <button id="track-btn" class="btn btn-primary btn-block">TRACK SHIPMENT</button>
        </div>
      `;

      document.getElementById('track-btn').onclick = () => {
        const val = document.getElementById('track-input').value.trim();
        if (val) {
          router.navigate(`/track-order?num=${val}`);
        }
      };
      return;
    }

    app.innerHTML = `<div class="container py-5 text-center"><div class="spinner"></div></div>`;

    try {
      const order = await store.apiCall(`/orders/track/${orderNum}`, 'GET', null, true);
      
      const statuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
      const currentIdx = statuses.indexOf(order.status);

      app.innerHTML = `
        <div class="container py-5" style="max-width:700px; margin: 0 auto;">
          <h1 class="font-serif text-center" style="font-size: 2rem; color:var(--color-primary);">Delivery Status</h1>
          <p class="text-center text-muted" style="font-size:0.85rem; margin-bottom: 3rem;">Order #: ${order.order_number}</p>
          
          <div class="timeline-container" style="display:flex; flex-direction:column; gap:1.5rem; position:relative; padding-left: 2rem;">
            <div style="position:absolute; left: 5px; top:0; bottom:0; width: 2px; background:#e2e8f0; z-index:1;"></div>
            
            ${statuses.map((s, idx) => {
              const isPassed = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              return `
                <div style="display:flex; gap:1.5rem; align-items:center; position:relative; z-index:2;">
                  <div style="width:12px; height:12px; border-radius:50%; background:${isPassed ? 'var(--color-primary)' : '#ccc'}; border:${isCurrent ? '4px solid var(--color-secondary)' : 'none'}; margin-left:-25px;"></div>
                  <div>
                    <h4 style="font-family:inherit; font-size:1rem; color:${isPassed ? 'var(--color-primary)' : '#767676'};">${s.toUpperCase()}</h4>
                    ${isCurrent ? `<p style="font-size:0.75rem; color:#767676;">Your order is currently at this stage.</p>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          ${order.tracking_number ? `
            <div style="background:#fff; border: 1px solid #f1efea; border-radius:4px; padding:1.5rem; margin-top:3rem;">
              <h4 style="font-family:inherit;">Shipment Details</h4>
              <p style="font-size:0.85rem; margin-top:0.4rem;"><strong>Courier:</strong> ${order.tracking_courier || 'Express'}</p>
              <p style="font-size:0.85rem;"><strong>Tracking #:</strong> ${order.tracking_number}</p>
              ${order.tracking_url ? `<a href="${order.tracking_url}" target="_blank" class="btn btn-outline btn-block mt-3 text-center">GO TO TRACKING PAGE</a>` : ''}
            </div>
          ` : ''}

        </div>
      `;
    } catch (e) {
      app.innerHTML = `
        <div class="container py-5 text-center" style="margin:5rem auto;">
          <h2>Tracking not available</h2>
          <p class="text-muted mt-2">Check order number or login status.</p>
          <a href="/track-order" class="btn btn-primary mt-4">BACK</a>
        </div>
      `;
    }
  },

  // 8. User Wishlist View
  Wishlist() {
    const app = document.getElementById('app');

    if (store.state.wishlist.length === 0) {
      app.innerHTML = `
        <div class="container text-center py-5" style="margin: 5rem auto;">
          <i class="fa-regular fa-heart" style="font-size:3.5rem; color:#ccc;"></i>
          <h2 class="font-serif mt-3" style="color:var(--color-primary);">Your Wishlist is Empty</h2>
          <p class="mt-2 text-muted">Save your favorite pieces here to purchase them later.</p>
          <a href="/shop" class="btn btn-primary mt-4">BROWSE OUT COLLECTION</a>
        </div>
      `;
      return;
    }

    app.innerHTML = `
      <div class="container py-5">
        <h1 class="font-serif mb-4" style="font-size: 2.2rem; color:var(--color-primary);">My Wishlist</h1>
        <div class="product-grid" id="wishlist-grid">
          <!-- Populated dynamically via component calls -->
        </div>
      </div>
    `;

    const loadWishlist = async () => {
      const grid = document.getElementById('wishlist-grid');
      try {
        const products = await store.apiCall('/products');
        const wishlistProducts = products.filter(p => store.state.wishlist.some(w => w.id === p.id));
        grid.innerHTML = wishlistProducts.map(p => components.ProductCard(p)).join('');
      } catch (err) {
        console.error(err);
      }
    };

    loadWishlist();

    const originalToggle = store.toggleWishlist;
    store.toggleWishlist = (prod) => {
      originalToggle.call(store, prod);
      this.Wishlist(); // Re-render wishlist view on modification
    };
  },

  // ─── Contact Us ─────────────────────────────────────────────────────────────
  Contact() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div style="background: linear-gradient(135deg,#faf7f4 0%,#f5ede6 100%); min-height:100vh; padding-bottom:5rem;">

        <!-- Hero Banner -->
        <div style="background:var(--color-primary); color:var(--color-bg-base); padding:4rem 1.5rem; text-align:center;">
          <p style="font-size:0.72rem; letter-spacing:0.25em; text-transform:uppercase; opacity:0.65; margin-bottom:0.6rem;">We'd love to hear from you</p>
          <h1 class="font-serif" style="font-size:2.8rem; color:var(--color-accent); line-height:1.15;">CONTACT US</h1>
        </div>

        <div class="container" style="max-width:1050px; padding-top:4rem;">
          <div style="display:grid; grid-template-columns:1fr 1.4fr; gap:3.5rem; align-items:start;">

            <!-- Left: Info cards -->
            <div style="display:flex; flex-direction:column; gap:1.8rem;">

              <div style="background:#fff; border-radius:8px; padding:2rem; box-shadow:var(--shadow-premium);">
                <div style="width:44px; height:44px; background:var(--color-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:1rem;">
                  <i class="fa-brands fa-whatsapp" style="color:#fff; font-size:1.25rem;"></i>
                </div>
                <h4 style="font-weight:700; color:var(--color-primary); margin-bottom:0.3rem;">WhatsApp Us</h4>
                <p style="font-size:0.85rem; color:#767676; margin-bottom:0.8rem;">Chat with us instantly for order queries, style advice, or any help.</p>
                <a href="https://wa.me/919004030555?text=Hi%20Fashnora%2C%20I%20need%20help%20with" target="_blank"
                   style="display:inline-flex; align-items:center; gap:0.5rem; font-weight:700; color:#25D366; font-size:0.92rem; text-decoration:none;">
                  <i class="fa-brands fa-whatsapp"></i> +91 90040 30555
                </a>
              </div>

              <div style="background:#fff; border-radius:8px; padding:2rem; box-shadow:var(--shadow-premium);">
                <div style="width:44px; height:44px; background:var(--color-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:1rem;">
                  <i class="fa-brands fa-instagram" style="color:#fff; font-size:1.25rem;"></i>
                </div>
                <h4 style="font-weight:700; color:var(--color-primary); margin-bottom:0.3rem;">Instagram DM</h4>
                <p style="font-size:0.85rem; color:#767676; margin-bottom:0.8rem;">Slide into our DMs — we reply to every message.</p>
                <a href="https://www.instagram.com/fashnorastudio/" target="_blank"
                   style="display:inline-flex; align-items:center; gap:0.5rem; font-weight:700; color:#C13584; font-size:0.92rem; text-decoration:none;">
                  <i class="fa-brands fa-instagram"></i> @fashnorastudio
                </a>
              </div>

              <div style="background:#fff; border-radius:8px; padding:2rem; box-shadow:var(--shadow-premium);">
                <div style="width:44px; height:44px; background:var(--color-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:1rem;">
                  <i class="fa-regular fa-envelope" style="color:#fff; font-size:1.25rem;"></i>
                </div>
                <h4 style="font-weight:700; color:var(--color-primary); margin-bottom:0.3rem;">Email Support</h4>
                <p style="font-size:0.85rem; color:#767676; margin-bottom:0.8rem;">We respond within 24 business hours.</p>
                <a href="mailto:support@fashnora.com"
                   style="display:inline-flex; align-items:center; gap:0.5rem; font-weight:700; color:var(--color-primary); font-size:0.92rem; text-decoration:none;">
                  <i class="fa-regular fa-envelope"></i> support@fashnora.com
                </a>
              </div>

              <div style="background:#fff; border-radius:8px; padding:2rem; box-shadow:var(--shadow-premium);">
                <div style="width:44px; height:44px; background:var(--color-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:1rem;">
                  <i class="fa-regular fa-clock" style="color:#fff; font-size:1.25rem;"></i>
                </div>
                <h4 style="font-weight:700; color:var(--color-primary); margin-bottom:0.3rem;">Support Hours</h4>
                <p style="font-size:0.85rem; color:#767676; line-height:1.8;">
                  Mon – Sat &nbsp;·&nbsp; 10 AM – 7 PM IST<br>
                  Sunday &nbsp;·&nbsp; 11 AM – 4 PM IST
                </p>
              </div>

            </div>

            <!-- Right: Contact Form -->
            <div style="background:#fff; border-radius:12px; padding:2.5rem; box-shadow:var(--shadow-premium);">
              <h2 class="font-serif" style="font-size:1.6rem; color:var(--color-primary); margin-bottom:0.4rem;">Send us a Message</h2>
              <p style="font-size:0.85rem; color:#767676; margin-bottom:2rem;">Fill the form below and we'll get back to you on WhatsApp within a few hours.</p>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; margin-bottom:1.2rem;">
                <div>
                  <label style="font-size:0.78rem; letter-spacing:0.08em; text-transform:uppercase; font-weight:600; color:var(--color-primary); display:block; margin-bottom:0.4rem;">Full Name *</label>
                  <input type="text" id="cf-name" class="admin-form-input" placeholder="Your name">
                </div>
                <div>
                  <label style="font-size:0.78rem; letter-spacing:0.08em; text-transform:uppercase; font-weight:600; color:var(--color-primary); display:block; margin-bottom:0.4rem;">Phone / WhatsApp *</label>
                  <input type="tel" id="cf-phone" class="admin-form-input" placeholder="+91 XXXXX XXXXX">
                </div>
              </div>

              <div style="margin-bottom:1.2rem;">
                <label style="font-size:0.78rem; letter-spacing:0.08em; text-transform:uppercase; font-weight:600; color:var(--color-primary); display:block; margin-bottom:0.4rem;">Email Address</label>
                <input type="email" id="cf-email" class="admin-form-input" placeholder="Optional but helpful">
              </div>

              <div style="margin-bottom:1.2rem;">
                <label style="font-size:0.78rem; letter-spacing:0.08em; text-transform:uppercase; font-weight:600; color:var(--color-primary); display:block; margin-bottom:0.4rem;">What's this about?</label>
                <select id="cf-subject" class="admin-form-input" style="background:#faf7f4;">
                  <option value="Order Query">Order Query / Tracking</option>
                  <option value="Product Info">Product Information</option>
                  <option value="Return Request">Return or Refund Request</option>
                  <option value="Exchange">Exchange Request</option>
                  <option value="Bulk Order">Bulk / Wholesale Order</option>
                  <option value="Other">Something Else</option>
                </select>
              </div>

              <div style="margin-bottom:2rem;">
                <label style="font-size:0.78rem; letter-spacing:0.08em; text-transform:uppercase; font-weight:600; color:var(--color-primary); display:block; margin-bottom:0.4rem;">Your Message *</label>
                <textarea id="cf-message" class="admin-form-textarea" rows="5" placeholder="Describe your query in detail — include order number if applicable."></textarea>
              </div>

              <button id="cf-submit" class="btn btn-primary btn-block" style="display:flex; align-items:center; justify-content:center; gap:0.6rem; font-size:0.85rem;">
                <i class="fa-brands fa-whatsapp"></i> SEND VIA WHATSAPP
              </button>
              <p style="font-size:0.75rem; color:#767676; text-align:center; margin-top:1rem;">Clicking "Send" will open WhatsApp with your message pre-filled.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('cf-submit').onclick = () => {
      const name = document.getElementById('cf-name').value.trim();
      const phone = document.getElementById('cf-phone').value.trim();
      const subject = document.getElementById('cf-subject').value;
      const message = document.getElementById('cf-message').value.trim();

      if (!name || !phone || !message) {
        store.showToast('Please fill in your name, phone, and message.');
        return;
      }

      const text = encodeURIComponent(
        `Hi Fashnora! 👋\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Query:* ${subject}\n\n${message}`
      );
      window.open(`https://wa.me/919004030555?text=${text}`, '_blank');
    };
  },

  // ─── FAQ ─────────────────────────────────────────────────────────────────────
  FAQ() {
    const app = document.getElementById('app');

    const faqs = [
      {
        category: 'Orders & Payments',
        items: [
          { q: 'How do I place an order?', a: 'Simply browse our collection, select your size and colour, then click "Add to Bag". Proceed to checkout, fill in your delivery details and choose a payment method. Your order is confirmed once payment is complete.' },
          { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD), UPI, Debit/Credit Cards, and Net Banking via Razorpay. All online transactions are fully encrypted and secure.' },
          { q: 'Can I modify or cancel my order?', a: 'Orders can be cancelled or modified within 12 hours of placement. Contact us on WhatsApp at +91 90040 30555 with your order number immediately.' },
          { q: 'Will I receive an order confirmation?', a: 'Yes! You will receive an order summary on the website after placing an order. If you\'ve provided an email, a confirmation will be sent there too.' },
        ]
      },
      {
        category: 'Shipping & Delivery',
        items: [
          { q: 'How long does delivery take?', a: 'Standard delivery takes 5–7 business days across India. Express delivery (2–3 days) is available for select pin codes at an additional charge.' },
          { q: 'Do you offer free shipping?', a: 'Yes! Orders above ₹3,999 qualify for free standard shipping. Orders below this threshold incur a flat ₹99 shipping fee.' },
          { q: 'Do you deliver outside India?', a: 'Currently we only deliver within India. International shipping is coming soon — follow us on Instagram @fashnorastudio for updates.' },
          { q: 'How do I track my order?', a: 'Visit the "Track Order" page in your account. You can also WhatsApp us your order number at +91 90040 30555 for real-time status.' },
        ]
      },
      {
        category: 'Returns & Exchanges',
        items: [
          { q: 'What is your return policy?', a: 'We offer a 7-day easy return window from the date of delivery. Items must be unworn, unwashed, with original tags attached and in original packaging.' },
          { q: 'How do I initiate a return?', a: 'Go to "My Orders" in your account and click "Return Item", or WhatsApp us at +91 90040 30555 with your order number and reason for return.' },
          { q: 'When will I get my refund?', a: 'Refunds are processed within 5–7 business days after the returned item is received and inspected. For COD orders, refunds are via bank transfer.' },
          { q: 'Can I exchange for a different size?', a: 'Yes! Exchanges are accepted within 7 days for size issues. We\'ll ship the replacement once we receive the original. WhatsApp us to initiate.' },
        ]
      },
      {
        category: 'Products & Sizing',
        items: [
          { q: 'How do I find my correct size?', a: 'Use our Size Guide (available on each product page) for accurate measurements. When in doubt between two sizes, we generally recommend sizing up for ethnic wear.' },
          { q: 'Are the product colours accurate?', a: 'We photograph all products under professional lighting to best represent true colours. Slight variation (5–10%) may occur due to screen settings.' },
          { q: 'Do you restock sold-out items?', a: 'Most of our pieces are limited-edition. Follow us on Instagram @fashnorastudio or WhatsApp us for restock requests on specific items.' },
          { q: 'Is the fabric quality premium?', a: 'Absolutely. We source premium georgette, silk, cotton, and linen fabrics from trusted Indian weavers. Each product listing specifies the exact fabric used.' },
        ]
      },
    ];

    app.innerHTML = `
      <div style="background:linear-gradient(135deg,#faf7f4 0%,#f5ede6 100%); min-height:100vh; padding-bottom:5rem;">

        <div style="background:var(--color-primary); color:var(--color-bg-base); padding:4rem 1.5rem; text-align:center;">
          <p style="font-size:0.72rem; letter-spacing:0.25em; text-transform:uppercase; opacity:0.65; margin-bottom:0.6rem;">Everything you need to know</p>
          <h1 class="font-serif" style="font-size:2.8rem; color:var(--color-accent); line-height:1.15;">FREQUENTLY ASKED QUESTIONS</h1>
        </div>

        <div class="container" style="max-width:820px; padding-top:4rem;">
          ${faqs.map((section, si) => `
            <div style="margin-bottom:3rem;">
              <h2 class="font-serif" style="font-size:1.35rem; color:var(--color-primary); margin-bottom:1.2rem; padding-bottom:0.6rem; border-bottom:2px solid var(--color-accent);">
                ${section.category}
              </h2>
              <div style="display:flex; flex-direction:column; gap:0.6rem;">
                ${section.items.map((item, i) => `
                  <div class="faq-item" style="background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 1px 8px rgba(82,23,39,0.07);">
                    <button onclick="(function(el){
                      const ans = el.nextElementSibling;
                      const icon = el.querySelector('.faq-icon');
                      const open = ans.style.maxHeight && ans.style.maxHeight !== '0px';
                      ans.style.maxHeight = open ? '0px' : ans.scrollHeight + 'px';
                      ans.style.opacity = open ? '0' : '1';
                      icon.style.transform = open ? 'rotate(0deg)' : 'rotate(45deg)';
                    })(this)"
                    style="width:100%; text-align:left; background:none; border:none; padding:1.2rem 1.5rem; display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-weight:600; color:var(--color-primary); font-size:0.92rem; gap:1rem;">
                      <span>${item.q}</span>
                      <i class="fa-solid fa-plus faq-icon" style="flex-shrink:0; transition:transform 0.3s; color:var(--color-accent);"></i>
                    </button>
                    <div style="max-height:0; overflow:hidden; transition:max-height 0.35s ease, opacity 0.25s; opacity:0; padding:0 1.5rem;">
                      <p style="padding-bottom:1.2rem; font-size:0.88rem; color:#555; line-height:1.75;">${item.a}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}

          <!-- Still need help CTA -->
          <div style="background:var(--color-primary); border-radius:12px; padding:2.5rem; text-align:center; color:var(--color-bg-base);">
            <h3 class="font-serif" style="color:var(--color-accent); font-size:1.5rem; margin-bottom:0.5rem;">Still have questions?</h3>
            <p style="font-size:0.88rem; opacity:0.8; margin-bottom:1.5rem;">Our team is available Mon–Sat, 10 AM – 7 PM IST</p>
            <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
              <a href="https://wa.me/919004030555" target="_blank" class="btn btn-outline" style="border-color:var(--color-accent); color:var(--color-accent); display:inline-flex; gap:0.5rem; align-items:center;">
                <i class="fa-brands fa-whatsapp"></i> WhatsApp Us
              </a>
              <a href="/contact" class="btn btn-outline" style="border-color:var(--color-bg-base); color:var(--color-bg-base);">Contact Form</a>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ─── Shipping Policy ─────────────────────────────────────────────────────────
  ShippingPolicy() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div style="background:linear-gradient(135deg,#faf7f4 0%,#f5ede6 100%); min-height:100vh; padding-bottom:5rem;">

        <div style="background:var(--color-primary); color:var(--color-bg-base); padding:4rem 1.5rem; text-align:center;">
          <p style="font-size:0.72rem; letter-spacing:0.25em; text-transform:uppercase; opacity:0.65; margin-bottom:0.6rem;">Transparent &amp; Hassle-free</p>
          <h1 class="font-serif" style="font-size:2.8rem; color:var(--color-accent); line-height:1.15;">SHIPPING POLICY</h1>
        </div>

        <div class="container" style="max-width:820px; padding-top:4rem;">

          <!-- Quick summary cards -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1.2rem; margin-bottom:3.5rem;">
            ${[
              { icon:'fa-truck', label:'Standard Delivery', value:'5–7 Business Days' },
              { icon:'fa-bolt', label:'Express Delivery', value:'2–3 Business Days' },
              { icon:'fa-gift', label:'Free Shipping', value:'Orders above ₹3,999' },
              { icon:'fa-indian-rupee-sign', label:'Shipping Fee', value:'₹99 flat rate' },
            ].map(c => `
              <div style="background:#fff; border-radius:10px; padding:1.5rem 1.2rem; text-align:center; box-shadow:var(--shadow-premium);">
                <i class="fa-solid ${c.icon}" style="font-size:1.6rem; color:var(--color-primary); margin-bottom:0.7rem;"></i>
                <p style="font-size:0.72rem; letter-spacing:0.1em; text-transform:uppercase; color:#767676; margin-bottom:0.3rem;">${c.label}</p>
                <p style="font-weight:700; color:var(--color-primary); font-size:0.95rem;">${c.value}</p>
              </div>
            `).join('')}
          </div>

          ${[
            {
              title: '1. Processing Time',
              body: `All orders are processed within <strong>1–2 business days</strong> (Monday to Saturday, excluding public holidays) after payment confirmation.
              <br><br>Orders placed after 5 PM IST will begin processing the next business day. You will receive a dispatch notification with tracking details once your order has shipped.`
            },
            {
              title: '2. Delivery Timelines',
              body: `<ul style="padding-left:1.2rem; line-height:2;">
                <li><strong>Standard Shipping:</strong> 5–7 business days (most pin codes in India)</li>
                <li><strong>Express Shipping:</strong> 2–3 business days (available for select metro pin codes)</li>
                <li><strong>Remote / Rural Areas:</strong> May take up to 10 business days</li>
              </ul>
              Delivery times are estimates and may vary during sale events, festive seasons, or due to courier partner delays.`
            },
            {
              title: '3. Shipping Charges',
              body: `<ul style="padding-left:1.2rem; line-height:2;">
                <li><strong>Free Standard Shipping</strong> on orders above ₹3,999</li>
                <li><strong>₹99 flat rate</strong> for standard shipping on orders below ₹3,999</li>
                <li><strong>Express Shipping:</strong> ₹149 additional (where available)</li>
              </ul>`
            },
            {
              title: '4. Order Tracking',
              body: `Once your order is shipped, you will receive a tracking ID. You can track your order via the <a href="/track-order" style="color:var(--color-accent); font-weight:600;">Track Order</a> page or by WhatsApping us at <a href="https://wa.me/919004030555" target="_blank" style="color:var(--color-accent); font-weight:600;">+91 90040 30555</a> with your order number.`
            },
            {
              title: '5. Pin Code Serviceability',
              body: `We deliver to <strong>20,000+ pin codes</strong> across India through our trusted courier partners (Bluedart, DTDC, Delhivery). If your area is not serviceable, you will be notified at checkout.`
            },
            {
              title: '6. Failed / Missed Deliveries',
              body: `Couriers make up to <strong>3 delivery attempts</strong>. After 3 failed attempts, the package is returned to our warehouse. A re-shipping charge of ₹99 will apply for a re-dispatch. Please ensure someone is available to receive the parcel or choose a convenient delivery address.`
            },
            {
              title: '7. Damaged or Wrong Items',
              body: `If you receive a damaged, defective, or wrong item, please <strong>WhatsApp us within 48 hours</strong> of delivery with your order number and clear photos. We will arrange an immediate replacement or full refund at no additional cost to you.`
            },
          ].map(s => `
            <div style="background:#fff; border-radius:10px; padding:2rem 2.2rem; margin-bottom:1.2rem; box-shadow:var(--shadow-premium);">
              <h3 style="font-size:1.05rem; font-weight:700; color:var(--color-primary); margin-bottom:0.8rem;">${s.title}</h3>
              <p style="font-size:0.88rem; color:#555; line-height:1.85;">${s.body}</p>
            </div>
          `).join('')}

          <div style="background:var(--color-primary); border-radius:12px; padding:2rem; text-align:center; margin-top:2.5rem; color:var(--color-bg-base);">
            <p style="font-size:0.88rem; opacity:0.85;">Questions about your shipment? We're here to help.</p>
            <a href="https://wa.me/919004030555" target="_blank" class="btn btn-outline" style="margin-top:1rem; border-color:var(--color-accent); color:var(--color-accent); display:inline-flex; gap:0.5rem; align-items:center;">
              <i class="fa-brands fa-whatsapp"></i> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    `;
  },

  // ─── Returns & Refunds Policy ─────────────────────────────────────────────────
  ReturnsRefunds() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div style="background:linear-gradient(135deg,#faf7f4 0%,#f5ede6 100%); min-height:100vh; padding-bottom:5rem;">

        <div style="background:var(--color-primary); color:var(--color-bg-base); padding:4rem 1.5rem; text-align:center;">
          <p style="font-size:0.72rem; letter-spacing:0.25em; text-transform:uppercase; opacity:0.65; margin-bottom:0.6rem;">Shop with complete confidence</p>
          <h1 class="font-serif" style="font-size:2.8rem; color:var(--color-accent); line-height:1.15;">RETURNS &amp; REFUNDS</h1>
        </div>

        <div class="container" style="max-width:820px; padding-top:4rem;">

          <!-- Quick process steps -->
          <div style="background:#fff; border-radius:12px; padding:2.5rem; margin-bottom:2.5rem; box-shadow:var(--shadow-premium);">
            <h2 class="font-serif" style="font-size:1.4rem; color:var(--color-primary); margin-bottom:1.5rem; text-align:center;">How to Return in 3 Easy Steps</h2>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:1.5rem; text-align:center;">
              ${[
                { step:'01', icon:'fa-mobile-screen-button', title:'Request Return', desc:'WhatsApp us at +91 90040 30555 or go to My Orders within 7 days of delivery.' },
                { step:'02', icon:'fa-box', title:'Pack & Ship', desc:'Pack the item with original tags in its original packaging. Our team will arrange pickup.' },
                { step:'03', icon:'fa-indian-rupee-sign', title:'Get Refunded', desc:'Refund processed within 5–7 business days after item inspection.' },
              ].map(s => `
                <div>
                  <div style="width:52px; height:52px; background:var(--color-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem;">
                    <i class="fa-solid ${s.icon}" style="color:#fff; font-size:1.2rem;"></i>
                  </div>
                  <div style="font-size:0.65rem; letter-spacing:0.15em; color:var(--color-accent); font-weight:700; margin-bottom:0.3rem;">STEP ${s.step}</div>
                  <h4 style="font-size:0.9rem; font-weight:700; color:var(--color-primary); margin-bottom:0.4rem;">${s.title}</h4>
                  <p style="font-size:0.8rem; color:#767676; line-height:1.6;">${s.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>

          ${[
            {
              title: '1. Return Eligibility',
              body: `Returns are accepted within <strong>7 days of delivery</strong>. To qualify, items must be:
              <ul style="padding-left:1.2rem; margin-top:0.6rem; line-height:2;">
                <li>Unworn and unwashed</li>
                <li>Original tags attached and intact</li>
                <li>In original packaging (poly bag or box)</li>
                <li>Free from any fragrance, stains, or visible use</li>
              </ul>
              <strong>Non-returnable items:</strong> Stitched/customised garments, undergarments, accessories, and sale items marked as "Final Sale".`
            },
            {
              title: '2. Exchange Policy',
              body: `We offer <strong>size exchanges</strong> within 7 days of delivery, subject to stock availability. For colour/style exchanges, please contact us and we will do our best to accommodate your request.
              <br><br>Shipping for exchange is free on the replacement dispatch. The original returned item must be received and inspected first.`
            },
            {
              title: '3. Refund Methods & Timeline',
              body: `<ul style="padding-left:1.2rem; line-height:2.1;">
                <li><strong>Online Payments (UPI/Card):</strong> Refund to original payment source within 5–7 business days</li>
                <li><strong>Cash on Delivery:</strong> Bank transfer (NEFT/UPI) within 7–10 business days</li>
                <li><strong>Store Credit:</strong> Available instantly as an option for faster resolution</li>
              </ul>
              Refunds are initiated only after the returned item passes quality inspection at our warehouse.`
            },
            {
              title: '4. Damaged / Defective Items',
              body: `If your order arrives damaged or defective, please <strong>WhatsApp us within 48 hours</strong> of delivery with:
              <ul style="padding-left:1.2rem; margin-top:0.6rem; line-height:2;">
                <li>Your order number</li>
                <li>Clear photos of the damage/defect</li>
                <li>Short description of the issue</li>
              </ul>
              We will arrange an immediate replacement or full refund — no questions asked. Return shipping will be covered by Fashnora.`
            },
            {
              title: '5. Wrong Item Delivered',
              body: `In the rare event you receive an incorrect item, contact us within <strong>48 hours</strong> with your order number and photos. We will ship the correct item within 2–3 business days and arrange pickup of the wrong item at our cost.`
            },
            {
              title: '6. How to Initiate a Return',
              body: `<strong>Option A:</strong> Log into your account, go to <em>My Orders</em>, select the item and click "Return / Exchange".<br><br>
              <strong>Option B:</strong> WhatsApp us at <a href="https://wa.me/919004030555" target="_blank" style="color:var(--color-accent); font-weight:600;">+91 90040 30555</a> with your Order Number, item name, and reason for return.<br><br>
              We will confirm your return request within <strong>24 business hours</strong> and guide you through the pickup process.`
            },
            {
              title: '7. Cancellations',
              body: `Orders can be cancelled within <strong>12 hours of placement</strong> for a full refund. After 12 hours, cancellations are not guaranteed as the order may already be dispatched. Reach us ASAP on WhatsApp if you need to cancel.`
            },
          ].map(s => `
            <div style="background:#fff; border-radius:10px; padding:2rem 2.2rem; margin-bottom:1.2rem; box-shadow:var(--shadow-premium);">
              <h3 style="font-size:1.05rem; font-weight:700; color:var(--color-primary); margin-bottom:0.8rem;">${s.title}</h3>
              <p style="font-size:0.88rem; color:#555; line-height:1.85;">${s.body}</p>
            </div>
          `).join('')}

          <div style="background:var(--color-primary); border-radius:12px; padding:2.5rem; text-align:center; margin-top:2.5rem; color:var(--color-bg-base);">
            <h3 class="font-serif" style="color:var(--color-accent); font-size:1.4rem; margin-bottom:0.5rem;">Need Help With a Return?</h3>
            <p style="font-size:0.88rem; opacity:0.8; margin-bottom:1.5rem;">Our team is ready to make it effortless.</p>
            <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
              <a href="https://wa.me/919004030555?text=Hi%20Fashnora%2C%20I%20want%20to%20initiate%20a%20return%20for%20Order%20No." target="_blank"
                 class="btn btn-outline" style="border-color:var(--color-accent); color:var(--color-accent); display:inline-flex; gap:0.5rem; align-items:center;">
                <i class="fa-brands fa-whatsapp"></i> Start Return on WhatsApp
              </a>
              <a href="/contact" class="btn btn-outline" style="border-color:var(--color-bg-base); color:var(--color-bg-base);">Contact Form</a>
            </div>
          </div>

        </div>
      </div>
    `;
  }

};
