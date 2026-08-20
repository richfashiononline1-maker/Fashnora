// Admin Panel Pages rendering logic for Fashnora

const admin = {
  // Render Sidebar and Topbar Shell for admin views
  renderShell(title, activeItem, contentHtml) {
    const app = document.getElementById('app');
    
    app.innerHTML = `
      <div class="admin-layout">
        <!-- Sidebar -->
        <aside class="admin-sidebar">
          <div class="admin-sidebar-header">FASHNORA ADMIN</div>
          <nav class="admin-sidebar-menu">
            <a href="/admin" class="admin-menu-item ${activeItem === 'dashboard' ? 'active' : ''}"><i class="fa-solid fa-chart-line"></i> Dashboard</a>
            <a href="/admin/products" class="admin-menu-item ${activeItem === 'products' ? 'active' : ''}"><i class="fa-solid fa-shirt"></i> Products</a>
            <a href="/admin/orders" class="admin-menu-item ${activeItem === 'orders' ? 'active' : ''}"><i class="fa-solid fa-receipt"></i> Orders</a>
            <a href="/admin/returns" class="admin-menu-item ${activeItem === 'returns' ? 'active' : ''}"><i class="fa-solid fa-rotate-left"></i> Returns</a>
            <a href="/admin/coupons" class="admin-menu-item ${activeItem === 'coupons' ? 'active' : ''}"><i class="fa-solid fa-ticket"></i> Coupons</a>
            <a href="/admin/settings" class="admin-menu-item ${activeItem === 'settings' ? 'active' : ''}"><i class="fa-solid fa-sliders"></i> Settings</a>
            <a href="/" class="admin-menu-item" style="margin-top:2rem; border-top:1px solid #334155; padding-top:1.5rem;"><i class="fa-solid fa-store"></i> View Store</a>
          </nav>
        </aside>

        <!-- Main Body -->
        <div class="admin-main">
          <header class="admin-topbar">
            <div class="admin-topbar-title">${title}</div>
            <div class="admin-topbar-profile">
              <span>Welcome, <strong>Admin</strong></span>
              <button onclick="store.logout()" style="color:var(--color-primary); font-weight:600; text-decoration:underline;">Logout</button>
            </div>
          </header>
          <div class="admin-content">
            ${contentHtml}
          </div>
        </div>
      </div>
    `;
  },

  // 1. Dashboard Landing page
  async Dashboard() {
    if (!this.checkAuth()) return;

    try {
      const stats = await store.apiCall('/admin/analytics', 'GET', null, true);
      const isMockMode = store.isMock();

      const html = `
        ${isMockMode ? `
          <div style="background-color:#FEF3C7; color:#D97706; padding:0.8rem 1.5rem; border-radius:4px; margin-bottom:1.5rem; font-size:0.85rem; font-weight:500;">
            <i class="fa-solid fa-circle-info"></i> Running in Database Mock Mode (MySQL offline). Admin CRUD adjustments are temporarily saved to local JSON.
          </div>
        ` : ''}

        <!-- Statistics widgets -->
        <div class="admin-stats-grid">
          <div class="admin-stat-card">
            <div class="admin-stat-info">
              <h3>Total Revenue</h3>
              <div class="admin-stat-value">₹${stats.totalRevenue}</div>
            </div>
            <div class="admin-stat-icon icon-blue"><i class="fa-solid fa-indian-rupee-sign"></i></div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-info">
              <h3>Pending Orders</h3>
              <div class="admin-stat-value">${stats.pendingOrdersCount}</div>
            </div>
            <div class="admin-stat-icon icon-amber"><i class="fa-solid fa-clock"></i></div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-info">
              <h3>Low Stock Items</h3>
              <div class="admin-stat-value">${stats.lowStockCount}</div>
            </div>
            <div class="admin-stat-icon icon-red"><i class="fa-solid fa-triangle-exclamation"></i></div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-info">
              <h3>Pending Returns</h3>
              <div class="admin-stat-value">${stats.pendingReturnsCount}</div>
            </div>
            <div class="admin-stat-icon icon-green"><i class="fa-solid fa-rotate-left"></i></div>
          </div>
        </div>

        <!-- Sales Chart -->
        <div class="admin-chart-card">
          <h3 style="font-size:1.1rem; margin-bottom:1rem;">Sales Growth</h3>
          <div class="admin-chart-bar-container">
            ${(stats.salesOverTime || [{date: 'No Data', amount: 0}]).map(s => `
              <div class="admin-chart-bar" style="height:${Math.min(s.amount / 500, 100)}%;">
                <span class="admin-chart-bar-value">₹${s.amount}</span>
              </div>
            `).join('')}
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:0.5rem; font-size:0.75rem; color:#64748B;">
            <span>Last 10 Orders</span>
          </div>
        </div>
      `;

      this.renderShell('Dashboard Overview', 'dashboard', html);
    } catch (e) {
      console.error(e);
      this.renderShell('Dashboard Overview', 'dashboard', '<p>Failed to load analytical metrics.</p>');
    }
  },

  // 2. Admin Products CRUD Manager
  async Products() {
    if (!this.checkAuth()) return;

    try {
      const products = await store.apiCall('/admin/products', 'GET', null, true);

      const html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <h3 style="font-size:1.1rem;">Manage Catalog</h3>
          <button id="add-product-btn" class="btn btn-primary" style="padding:0.5rem 1.5rem; font-size:0.8rem;">+ Add Product</button>
        </div>

        <!-- Add/Edit Product Form Drawer Modal (hidden initially) -->
        <div id="add-product-modal" class="modal-overlay hidden">
          <div class="modal-container" style="max-width:550px;">
            <button class="modal-close" onclick="document.getElementById('add-product-modal').classList.add('hidden')"><i class="fa-solid fa-xmark"></i></button>
            <h3 class="modal-title font-serif" id="product-modal-title">Add New Product</h3>
            <input type="hidden" id="p-id-edit" value="">
            
            <div class="admin-form-group mt-3">
              <label class="admin-form-label">Product Name</label>
              <input type="text" id="p-name" class="admin-form-input" required>
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">SKU</label>
              <input type="text" id="p-sku" class="admin-form-input" required>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div class="admin-form-group">
                <label class="admin-form-label">Price (Selling)</label>
                <input type="number" id="p-price" class="admin-form-input" required>
              </div>
              <div class="admin-form-group">
                <label class="admin-form-label">MRP (Original)</label>
                <input type="number" id="p-mrp" class="admin-form-input" required>
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
              <div class="admin-form-group">
                <label class="admin-form-label">Fabric</label>
                <input type="text" id="p-fabric" class="admin-form-input">
              </div>
              <div class="admin-form-group">
                <label class="admin-form-label">Occasion</label>
                <input type="text" id="p-occasion" class="admin-form-input">
              </div>
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Stock Quantity</label>
              <input type="number" id="p-stock" class="admin-form-input" required>
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Sizes (comma separated)</label>
              <input type="text" id="p-sizes" class="admin-form-input" placeholder="S,M,L,XL">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Colors (comma separated)</label>
              <input type="text" id="p-colors" class="admin-form-input" placeholder="Ivory,Burgundy">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Image URL</label>
              <input type="text" id="p-image" class="admin-form-input" placeholder="https://images.unsplash.com/...">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Description</label>
              <textarea id="p-desc" class="admin-form-textarea" rows="3"></textarea>
            </div>

            <button id="p-submit" class="btn btn-primary btn-block">SAVE PRODUCT</button>
          </div>
        </div>

        <!-- Products List Table -->
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr><th>Image</th><th>Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${products.map(p => `
                <tr>
                  <td><img src="${p.image_url}" style="width:40px; height:50px; object-fit:cover; border-radius:2px;"></td>
                  <td><strong>${p.name}</strong></td>
                  <td>${p.sku}</td>
                  <td>₹${p.price}</td>
                  <td>${p.stock_quantity <= p.low_stock_threshold ? `<span style="color:var(--status-cancelled); font-weight:700;">${p.stock_quantity} (Low)</span>` : p.stock_quantity}</td>
                  <td>
                    <button onclick="admin.editProductModal(${p.id})" style="color:var(--status-confirmed); font-weight:600; margin-right:1rem;"><i class="fa-regular fa-pen-to-square"></i> Edit</button>
                    <button onclick="admin.deleteProduct(${p.id})" style="color:var(--status-cancelled); font-weight:600;"><i class="fa-regular fa-trash-can"></i> Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      this.renderShell('Products Catalog', 'products', html);

      // Add product modal trigger
      document.getElementById('add-product-btn').onclick = () => {
        document.getElementById('product-modal-title').innerText = 'Add New Product';
        document.getElementById('p-id-edit').value = '';
        document.getElementById('p-name').value = '';
        document.getElementById('p-sku').value = '';
        document.getElementById('p-price').value = '';
        document.getElementById('p-mrp').value = '';
        document.getElementById('p-fabric').value = '';
        document.getElementById('p-occasion').value = '';
        document.getElementById('p-stock').value = '';
        document.getElementById('p-sizes').value = 'S,M,L,XL';
        document.getElementById('p-colors').value = 'Ivory,Burgundy';
        document.getElementById('p-image').value = '';
        document.getElementById('p-desc').value = '';
        document.getElementById('add-product-modal').classList.remove('hidden');
      };

      // Form submission
      document.getElementById('p-submit').onclick = async () => {
        const editId = document.getElementById('p-id-edit').value;
        const name = document.getElementById('p-name').value;
        const sku = document.getElementById('p-sku').value;
        const price = document.getElementById('p-price').value;
        const mrp = document.getElementById('p-mrp').value;
        const fabric = document.getElementById('p-fabric').value;
        const occasion = document.getElementById('p-occasion').value;
        const stock_quantity = document.getElementById('p-stock').value;
        const sizes = document.getElementById('p-sizes').value;
        const colors = document.getElementById('p-colors').value;
        const image_url = document.getElementById('p-image').value;
        const description = document.getElementById('p-desc').value;

        if (!name || !sku || !price || !mrp) {
          store.showToast('Please fill out required fields.');
          return;
        }

        try {
          if (editId) {
            await store.apiCall(`/admin/products/${editId}`, 'PUT', {
              name, price, mrp, fabric, occasion, stock_quantity, description
            }, true);
            store.showToast('Product updated successfully.');
          } else {
            await store.apiCall('/admin/products', 'POST', {
              name, sku, price, mrp, fabric, occasion, stock_quantity, sizes, colors, image_url, description
            }, true);
            store.showToast('Product saved successfully.');
          }
          
          document.getElementById('add-product-modal').classList.add('hidden');
          await this.Products();
        } catch (e) {
          store.showToast('Failed to save product.');
        }
      };

    } catch (e) {
      console.error(e);
      this.renderShell('Products Catalog', 'products', '<p>Failed to load products.</p>');
    }
  },

  async editProductModal(id) {
    try {
      const products = await store.apiCall('/admin/products', 'GET', null, true);
      const p = products.find(prod => prod.id === id);
      if (!p) return;

      document.getElementById('product-modal-title').innerText = 'Edit Product';
      document.getElementById('p-id-edit').value = p.id;
      document.getElementById('p-name').value = p.name || '';
      document.getElementById('p-sku').value = p.sku || '';
      document.getElementById('p-price').value = p.price || '';
      document.getElementById('p-mrp').value = p.mrp || '';
      document.getElementById('p-fabric').value = p.fabric || '';
      document.getElementById('p-occasion').value = p.occasion || '';
      document.getElementById('p-stock').value = p.stock_quantity || '0';
      document.getElementById('p-sizes').value = 'S,M,L,XL'; 
      document.getElementById('p-colors').value = 'Ivory,Burgundy';
      document.getElementById('p-image').value = p.image_url || '';
      document.getElementById('p-desc').value = p.description || '';
      
      document.getElementById('add-product-modal').classList.remove('hidden');
    } catch(e) {
      store.showToast('Failed to load product details.');
    }
  },

  async deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await store.apiCall(`/admin/products/${id}`, 'DELETE', null, true);
      store.showToast('Product deleted.');
      await this.Products();
    } catch (err) {
      store.showToast('Failed to delete product.');
    }
  },

  // 3. Admin Orders Management
  async Orders() {
    if (!this.checkAuth()) return;

    try {
      const orders = await store.apiCall('/admin/orders', 'GET', null, true);

      const html = `
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${orders.map(o => `
                <tr>
                  <td><strong>${o.order_number}</strong></td>
                  <td>${o.customer_name}</td>
                  <td>₹${o.grand_total}</td>
                  <td><span class="status-badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
                  <td>${o.payment_method} (${o.payment_status})</td>
                  <td>
                    <select onchange="admin.updateOrderStatus(${o.id}, this.value)" class="admin-form-select" style="padding:0.2rem; font-size:0.8rem; width:auto;">
                      <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                      <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                      <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                      <option value="Packed" ${o.status === 'Packed' ? 'selected' : ''}>Packed</option>
                      <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                      <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                      <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      this.renderShell('Orders list', 'orders', html);
    } catch (e) {
      console.error(e);
      this.renderShell('Orders list', 'orders', '<p>Failed to load orders.</p>');
    }
  },

  async updateOrderStatus(orderId, val) {
    try {
      await store.apiCall(`/admin/orders/${orderId}/status`, 'PUT', { status: val }, true);
      store.showToast('Order status updated.');
      await this.Orders();
    } catch (e) {
      store.showToast('Failed to update status.');
    }
  },

  // 4. Admin Returns Management
  async Returns() {
    if (!this.checkAuth()) return;

    try {
      const returns = await store.apiCall('/admin/returns', 'GET', null, true);

      const html = `
        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr><th>Order #</th><th>Product</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${returns.map(r => `
                <tr>
                  <td>${r.order_number}</td>
                  <td>${r.product_name}</td>
                  <td>${r.reason}</td>
                  <td><span class="status-badge" style="background:#e2e8f0;">${r.status}</span></td>
                  <td>
                    ${r.status === 'Pending' ? `
                      <button onclick="admin.processReturn(${r.id}, 'Approved')" style="color:var(--status-delivered); font-weight:700; margin-right:1rem;">Approve</button>
                      <button onclick="admin.processReturn(${r.id}, 'Rejected')" style="color:var(--status-cancelled); font-weight:700;">Reject</button>
                    ` : `
                      <span>Processed</span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      this.renderShell('Return Requests', 'returns', html);
    } catch (e) {
      console.error(e);
      this.renderShell('Return Requests', 'returns', '<p>Failed to load returns.</p>');
    }
  },

  async processReturn(id, decision) {
    try {
      await store.apiCall(`/admin/returns/${id}/status`, 'PUT', {
        status: decision,
        refund_status: decision === 'Approved' ? 'Processed' : 'None'
      }, true);
      store.showToast(`Return request ${decision.toLowerCase()}.`);
      await this.Returns();
    } catch (e) {
      store.showToast('Failed to process return request.');
    }
  },

  // 5. Coupons CRUD
  async Coupons() {
    if (!this.checkAuth()) return;

    try {
      const coupons = await store.apiCall('/admin/coupons', 'GET', null, true);

      const html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <h3 style="font-size:1.1rem;">Manage Discount Coupons</h3>
          <button id="add-coupon-btn" class="btn btn-primary" style="padding:0.5rem 1.5rem; font-size:0.8rem;">+ Create Coupon</button>
        </div>

        <!-- Add Coupon Modal -->
        <div id="add-coupon-modal" class="modal-overlay hidden">
          <div class="modal-container" style="max-width:450px;">
            <button class="modal-close" onclick="document.getElementById('add-coupon-modal').classList.add('hidden')"><i class="fa-solid fa-xmark"></i></button>
            <h3 class="modal-title font-serif">Create Coupon</h3>
            
            <div class="admin-form-group mt-3">
              <label class="admin-form-label">Coupon Code</label>
              <input type="text" id="c-code" class="admin-form-input" placeholder="WINTER20" required>
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Discount Type</label>
              <select id="c-type" class="admin-form-select">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Flat Discount (₹)</option>
              </select>
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Discount Value</label>
              <input type="number" id="c-value" class="admin-form-input" required>
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Minimum Purchase Required</label>
              <input type="number" id="c-min" class="admin-form-input" value="0">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Expiry Date</label>
              <input type="date" id="c-expiry" class="admin-form-input" required>
            </div>

            <button id="c-submit" class="btn btn-primary btn-block">SAVE COUPON</button>
          </div>
        </div>

        <div class="admin-table-container">
          <table class="admin-table">
            <thead>
              <tr><th>Code</th><th>Type</th><th>Value</th><th>Min Purchase</th><th>Expiry</th></tr>
            </thead>
            <tbody>
              ${coupons.map(c => `
                <tr>
                  <td><strong>${c.code}</strong></td>
                  <td>${c.type}</td>
                  <td>${c.type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                  <td>₹${c.min_order_amount}</td>
                  <td>${new Date(c.expiry_date).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      this.renderShell('Coupons Manager', 'coupons', html);

      document.getElementById('add-coupon-btn').onclick = () => {
        document.getElementById('add-coupon-modal').classList.remove('hidden');
      };

      document.getElementById('c-submit').onclick = async () => {
        const code = document.getElementById('c-code').value;
        const type = document.getElementById('c-type').value;
        const discount_value = document.getElementById('c-value').value;
        const min_order_amount = document.getElementById('c-min').value;
        const expiry_date = document.getElementById('c-expiry').value;

        if (!code || !discount_value || !expiry_date) {
          store.showToast('Please fill all required fields.');
          return;
        }

        try {
          await store.apiCall('/admin/coupons', 'POST', {
            code, type, discount_value, min_order_amount, expiry_date
          }, true);
          store.showToast('Coupon created successfully.');
          document.getElementById('add-coupon-modal').classList.add('hidden');
          await this.Coupons();
        } catch (e) {
          store.showToast('Failed to create coupon.');
        }
      };

    } catch (e) {
      console.error(e);
      this.renderShell('Coupons Manager', 'coupons', '<p>Failed to load coupons.</p>');
    }
  },

  // 6. Admin Storefront Settings
  async Settings() {
    if (!this.checkAuth()) return;

    try {
      const html = `
        <div style="background:#fff; padding:2.5rem; border-radius:8px; border: 1px solid var(--admin-border); max-width:600px; box-shadow:var(--shadow-premium);">
          <h3 class="font-serif mb-4" style="color:var(--color-primary);">Configure Store Parameters</h3>
          
          <div class="admin-form-group">
            <label class="admin-form-label">Announcement Text</label>
            <input type="text" id="set-announcement" class="admin-form-input" value="${store.state.banners.find(b => b.section === 'announcement')?.subtitle || ''}">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label">Store Phone Number</label>
            <input type="text" id="set-phone" class="admin-form-input" value="${store.state.settings.store_phone || ''}">
          </div>

          <div class="admin-form-group">
            <label class="admin-form-label">WhatsApp Contact Number</label>
            <input type="text" id="set-whatsapp" class="admin-form-input" value="${store.state.settings.whatsapp_number || ''}">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
            <div class="admin-form-group">
              <label class="admin-form-label">Shipping Charge (₹)</label>
              <input type="number" id="set-shipping" class="admin-form-input" value="${store.state.settings.shipping_charges || ''}">
            </div>
            <div class="admin-form-group">
              <label class="admin-form-label">Free Shipping Limit (₹)</label>
              <input type="number" id="set-limit" class="admin-form-input" value="${store.state.settings.free_shipping_threshold || ''}">
            </div>
          </div>

          <button id="save-settings-btn" class="btn btn-primary btn-block mt-3">UPDATE STORE SETTINGS</button>
        </div>
      `;

      this.renderShell('Store Settings', 'settings', html);

      document.getElementById('save-settings-btn').onclick = async () => {
        const text = document.getElementById('set-announcement').value;
        const phone = document.getElementById('set-phone').value;
        const whatsapp = document.getElementById('set-whatsapp').value;
        const shipping = document.getElementById('set-shipping').value;
        const limit = document.getElementById('set-limit').value;

        try {
          // Update key-value settings
          await store.apiCall('/admin/settings', 'PUT', {
            store_phone: phone,
            whatsapp_number: whatsapp,
            shipping_charges: shipping,
            free_shipping_threshold: limit
          }, true);

          // Update text banner
          await store.apiCall('/admin/announcement', 'PUT', { announcement_text: text }, true);

          store.showToast('Store settings updated successfully.');
          await store.init(); // Refresh settings state
          await this.Settings();
        } catch (e) {
          store.showToast('Failed to update configurations.');
        }
      };

    } catch (e) {
      console.error(e);
      this.renderShell('Store Settings', 'settings', '<p>Failed to load configurations.</p>');
    }
  },

  // Helper security guard
  checkAuth() {
    if (!store.state.token || (store.state.user.role !== 'admin' && store.state.user.role !== 'superadmin')) {
      store.showToast('Access Denied. Admins only.');
      router.navigate('/account');
      return false;
    }
    return true;
  }
};
