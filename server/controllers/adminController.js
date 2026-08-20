const db = require('../config/db');

const getAnalytics = async (req, res) => {
  try {
    let products = [];
    let orders = [];
    let users = [];
    let returns = [];

    const mock = db.isMock();
    if (mock) {
      const d = db.getMockData();
      products = d.products;
      orders = d.orders;
      users = d.users;
      returns = d.returns;
    } else {
      products = await db.query('SELECT * FROM products');
      orders = await db.query('SELECT * FROM orders');
      users = await db.query('SELECT * FROM users');
      returns = await db.query('SELECT * FROM returns');
    }

    // Calculations
    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled' && o.payment_status === 'Paid')
      .reduce((sum, o) => sum + parseFloat(o.grand_total), 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySales = orders
      .filter(o => new Date(o.created_at) >= todayStart && o.status !== 'Cancelled')
      .reduce((sum, o) => sum + parseFloat(o.grand_total), 0);

    const lowStockProducts = products.filter(p => p.stock_quantity <= p.low_stock_threshold);
    const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed').length;
    const pendingReturnsCount = returns.filter(r => r.status === 'Pending').length;

    // Charts
    const salesOverTime = orders
      .filter(o => o.status !== 'Cancelled')
      .slice(-10)
      .map(o => ({
        date: new Date(o.created_at).toLocaleDateString(),
        amount: parseFloat(o.grand_total)
      }));

    res.json({
      totalRevenue,
      todaySales,
      totalOrders: orders.length,
      totalCustomers: users.filter(u => u.role === 'customer').length,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      pendingOrdersCount,
      pendingReturnsCount,
      salesOverTime
    });
  } catch (error) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ message: 'Server error generating analytics.' });
  }
};

const updateStoreSettings = async (req, res) => {
  const { store_name, store_phone, whatsapp_number, shipping_charges, free_shipping_threshold, cod_enabled } = req.body;
  try {
    const keys = { store_name, store_phone, whatsapp_number, shipping_charges, free_shipping_threshold, cod_enabled };
    
    for (const [key, val] of Object.entries(keys)) {
      if (val !== undefined) {
        await db.query('UPDATE settings SET value = ? WHERE `key` = ?', [String(val), key]);
      }
    }

    if (db.isMock()) {
      db.saveMockData();
    }

    res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (error) {
    console.error('updateStoreSettings error:', error);
    res.status(500).json({ message: 'Server error updating settings.' });
  }
};

// Admin Products CRUD
const adminGetProducts = async (req, res) => {
  try {
    const products = await db.query('SELECT p.* FROM products p');
    res.json(products);
  } catch (error) {
    console.error('adminGetProducts error:', error);
    res.status(500).json({ message: 'Server error fetching products.' });
  }
};

const adminCreateProduct = async (req, res) => {
  const { name, sku, price, mrp, discount, fabric, occasion, description, stock_quantity, is_bestseller, is_new_arrival, is_sale, sizes, colors, image_url } = req.body;
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    let productId;
    if (db.isMock()) {
      const data = db.getMockData();
      productId = data.products.length + 1;
      const newProd = {
        id: productId,
        name,
        slug,
        sku,
        description,
        price: parseFloat(price),
        mrp: parseFloat(mrp),
        discount: parseInt(discount) || 0,
        fabric,
        occasion,
        stock_quantity: parseInt(stock_quantity),
        low_stock_threshold: 5,
        is_bestseller: is_bestseller ? 1 : 0,
        is_new_arrival: is_new_arrival ? 1 : 0,
        is_sale: is_sale ? 1 : 0,
        status: 'active',
        created_at: new Date().toISOString()
      };
      data.products.push(newProd);

      // Add image
      if (image_url) {
        data.product_images.push({
          id: data.product_images.length + 1,
          product_id: productId,
          image_url,
          is_primary: 1
        });
      }

      // Add size/color variants
      let varId = data.product_variants.length + 1;
      const colArr = colors ? colors.split(',') : ['Default'];
      const sizArr = sizes ? sizes.split(',') : ['Free Size'];

      for (const col of colArr) {
        for (const siz of sizArr) {
          data.product_variants.push({
            id: varId++,
            product_id: productId,
            color: col.trim(),
            size: siz.trim(),
            stock_quantity: Math.floor(stock_quantity / (colArr.length * sizArr.length)) || 5,
            sku: `${sku}-${col.trim().substring(0,3).toUpperCase()}-${siz.trim()}`
          });
        }
      }

      db.saveMockData();
    } else {
      const result = await db.query(
        'INSERT INTO products (name, slug, sku, price, mrp, discount, fabric, occasion, description, stock_quantity, is_bestseller, is_new_arrival, is_sale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, slug, sku, price, mrp, discount || 0, fabric, occasion, description, stock_quantity, is_bestseller ? 1 : 0, is_new_arrival ? 1 : 0, is_sale ? 1 : 0]
      );
      productId = result.insertId;

      if (image_url) {
        await db.query('INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, 1)', [productId, image_url]);
      }

      // insert variants
      const colArr = colors ? colors.split(',') : ['Default'];
      const sizArr = sizes ? sizes.split(',') : ['Free Size'];

      for (const col of colArr) {
        for (const siz of sizArr) {
          await db.query(
            'INSERT INTO product_variants (product_id, color, size, stock_quantity, sku) VALUES (?, ?, ?, ?, ?)',
            [productId, col.trim(), siz.trim(), Math.floor(stock_quantity / (colArr.length * sizArr.length)) || 5, `${sku}-${col.trim().substring(0,3).toUpperCase()}-${siz.trim()}`]
          );
        }
      }
    }

    res.json({ success: true, message: 'Product created successfully.' });
  } catch (error) {
    console.error('adminCreateProduct error:', error);
    res.status(500).json({ message: 'Server error creating product.' });
  }
};

const adminUpdateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, mrp, discount, fabric, occasion, description, stock_quantity, status } = req.body;
  try {
    const prodId = parseInt(id);

    if (db.isMock()) {
      const data = db.getMockData();
      const p = data.products.find(p => p.id === prodId);
      if (p) {
        if (name) p.name = name;
        if (price) p.price = parseFloat(price);
        if (mrp) p.mrp = parseFloat(mrp);
        if (discount !== undefined) p.discount = parseInt(discount);
        if (fabric) p.fabric = fabric;
        if (occasion) p.occasion = occasion;
        if (description) p.description = description;
        if (stock_quantity !== undefined) p.stock_quantity = parseInt(stock_quantity);
        if (status) p.status = status;
      }
      db.saveMockData();
    } else {
      await db.query(
        'UPDATE products SET name = ?, price = ?, mrp = ?, discount = ?, fabric = ?, occasion = ?, description = ?, stock_quantity = ?, status = ? WHERE id = ?',
        [name, price, mrp, discount, fabric, occasion, description, stock_quantity, status, prodId]
      );
    }
    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (error) {
    console.error('adminUpdateProduct error:', error);
    res.status(500).json({ message: 'Server error updating product.' });
  }
};

const adminDeleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const prodId = parseInt(id);
    if (db.isMock()) {
      const data = db.getMockData();
      data.products = data.products.filter(p => p.id !== prodId);
      data.product_images = data.product_images.filter(img => img.product_id !== prodId);
      data.product_variants = data.product_variants.filter(v => v.product_id !== prodId);
      db.saveMockData();
    } else {
      await db.query('DELETE FROM products WHERE id = ?', [prodId]);
    }
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('adminDeleteProduct error:', error);
    res.status(500).json({ message: 'Server error deleting product.' });
  }
};

// Admin Orders
const adminGetOrders = async (req, res) => {
  try {
    let orders = [];
    if (db.isMock()) {
      orders = db.getMockData().orders;
      // Enrich with user name
      orders = orders.map(o => {
        const u = db.getMockData().users.find(u => u.id === o.user_id);
        return { ...o, customer_name: u ? u.name : 'Guest Customer' };
      });
    } else {
      orders = await db.query('SELECT o.*, u.name as customer_name FROM orders o JOIN users u ON o.user_id = u.id');
    }
    res.json(orders);
  } catch (error) {
    console.error('adminGetOrders error:', error);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
};

const adminUpdateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, tracking_courier, tracking_number, tracking_url } = req.body;
  try {
    const orderId = parseInt(id);
    if (db.isMock()) {
      const data = db.getMockData();
      const order = data.orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        if (tracking_courier) order.tracking_courier = tracking_courier;
        if (tracking_number) order.tracking_number = tracking_number;
        if (tracking_url) order.tracking_url = tracking_url;
      }
      db.saveMockData();
    } else {
      await db.query(
        'UPDATE orders SET status = ?, tracking_courier = ?, tracking_number = ?, tracking_url = ? WHERE id = ?',
        [status, tracking_courier || null, tracking_number || null, tracking_url || null, orderId]
      );
    }
    res.json({ success: true, message: 'Order status updated successfully.' });
  } catch (error) {
    console.error('adminUpdateOrderStatus error:', error);
    res.status(500).json({ message: 'Server error updating order.' });
  }
};

// Admin Customers
const adminGetCustomers = async (req, res) => {
  try {
    const customers = await db.query('SELECT id, name, email, role, phone, status, created_at FROM users WHERE role = "customer"');
    res.json(customers);
  } catch (error) {
    console.error('adminGetCustomers error:', error);
    res.status(500).json({ message: 'Server error fetching customers.' });
  }
};

// Admin Returns
const adminGetReturns = async (req, res) => {
  try {
    let returns = [];
    if (db.isMock()) {
      returns = db.getMockData().returns;
      returns = returns.map(r => {
        const o = db.getMockData().orders.find(ord => ord.id === r.order_id);
        const p = db.getMockData().products.find(prod => prod.id === r.product_id);
        return {
          ...r,
          order_number: o ? o.order_number : 'N/A',
          product_name: p ? p.name : 'Unknown Product'
        };
      });
    } else {
      returns = await db.query(
        'SELECT r.*, o.order_number, p.name as product_name FROM returns r JOIN orders o ON r.order_id = o.id JOIN products p ON r.product_id = p.id'
      );
    }
    res.json(returns);
  } catch (error) {
    console.error('adminGetReturns error:', error);
    res.status(500).json({ message: 'Server error fetching returns.' });
  }
};

const adminUpdateReturnStatus = async (req, res) => {
  const { id } = req.params;
  const { status, refund_status } = req.body;
  try {
    const returnId = parseInt(id);
    if (db.isMock()) {
      const data = db.getMockData();
      const r = data.returns.find(ret => ret.id === returnId);
      if (r) {
        r.status = status;
        if (refund_status) r.refund_status = refund_status;
        if (status === 'Refunded') {
          // update order status
          const o = data.orders.find(ord => ord.id === r.order_id);
          if (o) {
            o.status = 'Refunded';
            o.payment_status = 'Refunded';
          }
        }
      }
      db.saveMockData();
    } else {
      await db.query('UPDATE returns SET status = ?, refund_status = ? WHERE id = ?', [status, refund_status, returnId]);
      if (status === 'Refunded') {
        const ret = await db.query('SELECT order_id FROM returns WHERE id = ?', [returnId]);
        if (ret.length > 0) {
          await db.query('UPDATE orders SET status = "Refunded", payment_status = "Refunded" WHERE id = ?', [ret[0].order_id]);
        }
      }
    }
    res.json({ success: true, message: 'Return status updated successfully.' });
  } catch (error) {
    console.error('adminUpdateReturnStatus error:', error);
    res.status(500).json({ message: 'Server error updating return request.' });
  }
};

// Admin Coupons CRUD
const adminGetCoupons = async (req, res) => {
  try {
    const coupons = await db.query('SELECT * FROM coupons');
    res.json(coupons);
  } catch (error) {
    console.error('adminGetCoupons error:', error);
    res.status(500).json({ message: 'Server error fetching coupons.' });
  }
};

const adminCreateCoupon = async (req, res) => {
  const { code, type, discount_value, min_order_amount, max_discount_amount, expiry_date } = req.body;
  try {
    if (db.isMock()) {
      const data = db.getMockData();
      data.coupons.push({
        id: data.coupons.length + 1,
        code: code.toUpperCase(),
        type,
        discount_value: parseFloat(discount_value),
        min_order_amount: parseFloat(min_order_amount) || 0,
        max_discount_amount: parseFloat(max_discount_amount) || null,
        start_date: new Date().toISOString().split('T')[0],
        expiry_date,
        status: 'active'
      });
      db.saveMockData();
    } else {
      await db.query(
        'INSERT INTO coupons (code, type, discount_value, min_order_amount, max_discount_amount, start_date, expiry_date, status) VALUES (?, ?, ?, ?, ?, CURRENT_DATE, ?, "active")',
        [code.toUpperCase(), type, discount_value, min_order_amount, max_discount_amount, expiry_date]
      );
    }
    res.json({ success: true, message: 'Coupon created successfully.' });
  } catch (error) {
    console.error('adminCreateCoupon error:', error);
    res.status(500).json({ message: 'Server error creating coupon.' });
  }
};

// Admin Banners Update
const adminUpdateBanner = async (req, res) => {
  const { announcement_text } = req.body;
  try {
    if (db.isMock()) {
      const data = db.getMockData();
      const banner = data.banners.find(b => b.section === 'announcement');
      if (banner) {
        banner.subtitle = announcement_text;
      }
      db.saveMockData();
    } else {
      await db.query('UPDATE banners SET subtitle = ? WHERE section = "announcement"', [announcement_text]);
    }
    res.json({ success: true, message: 'Announcement updated successfully.' });
  } catch (error) {
    console.error('adminUpdateBanner error:', error);
    res.status(500).json({ message: 'Server error updating announcement banner.' });
  }
};

module.exports = {
  getAnalytics,
  updateStoreSettings,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminGetCustomers,
  adminGetReturns,
  adminUpdateReturnStatus,
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateBanner
};
