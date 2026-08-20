const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let pool = null;
let isMockMode = false;
let mockData = {};
const mockFilePath = path.join(__dirname, '..', 'db', 'mock_db.json');

// Initialize mock database file with seed data
function initializeMockDb() {
  if (fs.existsSync(mockFilePath)) {
    try {
      mockData = JSON.parse(fs.readFileSync(mockFilePath, 'utf8'));
      console.log('Mock database loaded from file.');
      return;
    } catch (e) {
      console.error('Failed to parse mock DB file. Re-initializing...');
    }
  }

  // Fallback initial structures
  mockData = {
    users: [
      {
        id: 1,
        name: 'Fashnora Admin',
        email: 'admin@fashnora.com',
        password_hash: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        phone: '+919999999999',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ],
    categories: [
      { id: 1, name: 'Cord Sets', slug: 'women-cord-sets', parent_id: null, gender: 'women' },
      { id: 2, name: 'Suits', slug: 'women-suits', parent_id: null, gender: 'women' },
      { id: 3, name: 'Indo-Western', slug: 'women-indo-western', parent_id: null, gender: 'women' },
      { id: 4, name: 'Kurtis', slug: 'women-kurtis', parent_id: null, gender: 'women' },
      { id: 5, name: 'Gowns', slug: 'women-gowns', parent_id: null, gender: 'women' },
      { id: 6, name: 'Sarees', slug: 'women-sarees', parent_id: null, gender: 'women' },
      { id: 7, name: 'Tops', slug: 'women-tops', parent_id: null, gender: 'women' },
      { id: 8, name: 'Girls', slug: 'kids-girls', parent_id: null, gender: 'kids' },
      { id: 9, name: 'Boys', slug: 'kids-boys', parent_id: null, gender: 'kids' },
      { id: 10, name: 'Western Outfits', slug: 'girls-western', parent_id: 8, gender: 'kids' },
      { id: 11, name: 'Cord Sets', slug: 'girls-cord-sets', parent_id: 8, gender: 'kids' },
      { id: 12, name: 'Traditional Wear', slug: 'girls-traditional', parent_id: 8, gender: 'kids' },
      { id: 13, name: 'Casual Wear', slug: 'girls-casual', parent_id: 8, gender: 'kids' },
      { id: 14, name: 'Western Wear', slug: 'boys-western', parent_id: 9, gender: 'kids' },
      { id: 15, name: 'Traditional Wear', slug: 'boys-traditional', parent_id: 9, gender: 'kids' },
      { id: 16, name: 'Casual Wear', slug: 'boys-casual', parent_id: 9, gender: 'kids' },
      { id: 17, name: 'Party Wear', slug: 'boys-party', parent_id: 9, gender: 'kids' }
    ],
    products: [
      {
        id: 1,
        name: 'Elysian Burgundy Georgette Saree',
        slug: 'elysian-burgundy-georgette-saree',
        sku: 'FN-W-SAR-001',
        description: 'An elegant burgundy georgette saree featuring delicate sequin borders and hand-embellished details. Perfect for wedding guests and celebratory gatherings.',
        price: 2499.00,
        mrp: 4999.00,
        discount: 50,
        fabric: 'Premium Georgette',
        occasion: 'Festive Wear',
        care_instructions: 'Dry clean only. Store in a clean muslin cloth.',
        stock_quantity: 15,
        low_stock_threshold: 5,
        is_bestseller: 1,
        is_new_arrival: 1,
        is_sale: 1,
        seo_title: 'Elysian Burgundy Georgette Saree | Fashnora',
        seo_description: 'An elegant burgundy georgette saree featuring delicate sequin borders and hand-embellished details.',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Ivory Floral Printed Kurti Suit Set',
        slug: 'ivory-floral-printed-kurti-suit-set',
        sku: 'FN-W-KRT-002',
        description: 'A beautiful ivory-colored A-line kurti set accented with floral motifs and matching palazzo trousers, accompanied by a lightweight dupatta.',
        price: 1899.00,
        mrp: 2999.00,
        discount: 37,
        fabric: 'Pure Cotton Lurex',
        occasion: 'Casual Wear',
        care_instructions: 'Hand wash separately in cold water with mild detergent.',
        stock_quantity: 22,
        low_stock_threshold: 5,
        is_bestseller: 0,
        is_new_arrival: 1,
        is_sale: 1,
        seo_title: 'Ivory Floral Printed Kurti Suit Set | Fashnora',
        seo_description: 'A beautiful ivory-colored A-line kurti set accented with floral motifs.',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Champagne Gold Embellished Indo-Western Gown',
        slug: 'champagne-gold-embellished-indo-western-gown',
        sku: 'FN-W-GWN-003',
        description: 'Make a statement at any evening gala with this flowing champagne gold Indo-Western gown decorated with intricate metallic embroidery and beads.',
        price: 4500.00,
        mrp: 8999.00,
        discount: 50,
        fabric: 'Premium Silk & Net',
        occasion: 'Party Wear',
        care_instructions: 'Dry clean only.',
        stock_quantity: 8,
        low_stock_threshold: 5,
        is_bestseller: 1,
        is_new_arrival: 0,
        is_sale: 0,
        seo_title: 'Champagne Gold Embellished Indo-Western Gown | Fashnora',
        seo_description: 'Make a statement at any evening gala with this flowing champagne gold Indo-Western gown.',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Sage Green Linen Casual Co-ord Set',
        slug: 'sage-green-linen-casual-co-ord-set',
        sku: 'FN-W-CRD-004',
        description: 'An easy-breezy co-ord set featuring a button-down linen shirt and high-waisted relaxed-fit trousers. Perfect for weekend outings or office casual days.',
        price: 1599.00,
        mrp: 2499.00,
        discount: 36,
        fabric: '100% Breathable Linen',
        occasion: 'Everyday Style',
        care_instructions: 'Gentle machine wash with like colors.',
        stock_quantity: 3,
        low_stock_threshold: 5,
        is_bestseller: 0,
        is_new_arrival: 1,
        is_sale: 0,
        seo_title: 'Sage Green Linen Casual Co-ord Set | Fashnora',
        seo_description: 'An easy-breezy co-ord set featuring a button-down linen shirt and high-waisted relaxed-fit trousers.',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 5,
        name: 'Peach Blossom Girls Lehenga Choli',
        slug: 'peach-blossom-girls-lehenga-choli',
        sku: 'FN-K-GIR-001',
        description: 'Let your little girl shine in this vibrant peach-colored lehenga choli set, featuring a soft organza dupatta and traditional gold foil print details.',
        price: 2199.00,
        mrp: 3999.00,
        discount: 45,
        fabric: 'Art Silk and Organza',
        occasion: 'Festive Wear',
        care_instructions: 'Dry clean only.',
        stock_quantity: 12,
        low_stock_threshold: 5,
        is_bestseller: 1,
        is_new_arrival: 1,
        is_sale: 1,
        seo_title: 'Peach Blossom Girls Lehenga Choli | Fashnora',
        seo_description: 'Let your little girl shine in this vibrant peach-colored lehenga choli set.',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 6,
        name: 'Royal Blue Boys Kurta & Nehru Jacket Set',
        slug: 'royal-blue-boys-kurta-nehru-jacket-set',
        sku: 'FN-K-BOY-001',
        description: 'A dapper traditional kurta set for boys, paired with pyjamas and a beautifully printed Nehru jacket.',
        price: 1799.00,
        mrp: 2999.00,
        discount: 40,
        fabric: 'Cotton Silk Blend',
        occasion: 'Wedding Guest',
        care_instructions: 'Gentle hand wash separately.',
        stock_quantity: 18,
        low_stock_threshold: 5,
        is_bestseller: 1,
        is_new_arrival: 0,
        is_sale: 0,
        seo_title: 'Royal Blue Boys Kurta & Nehru Jacket Set | Fashnora',
        seo_description: 'A handsome royal blue traditional kurta set for boys, paired with pyjamas and a Nehru jacket.',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ],
    product_images: [
      { id: 1, product_id: 1, image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
      { id: 2, product_id: 1, image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80', is_primary: 0 },
      { id: 3, product_id: 2, image_url: 'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
      { id: 4, product_id: 3, image_url: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
      { id: 5, product_id: 4, image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
      { id: 6, product_id: 5, image_url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80', is_primary: 1 },
      { id: 7, product_id: 6, image_url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80', is_primary: 1 }
    ],
    product_variants: [
      { id: 1, product_id: 1, color: 'Burgundy', size: 'Free Size', stock_quantity: 15, sku: 'FN-W-SAR-001-BUR-FS' },
      { id: 2, product_id: 2, color: 'Ivory', size: 'S', stock_quantity: 5, sku: 'FN-W-KRT-002-IVO-S' },
      { id: 3, product_id: 2, color: 'Ivory', size: 'M', stock_quantity: 5, sku: 'FN-W-KRT-002-IVO-M' },
      { id: 4, product_id: 2, color: 'Ivory', size: 'L', stock_quantity: 5, sku: 'FN-W-KRT-002-IVO-L' },
      { id: 5, product_id: 2, color: 'Ivory', size: 'XL', stock_quantity: 7, sku: 'FN-W-KRT-002-IVO-XL' },
      { id: 6, product_id: 3, color: 'Champagne Gold', size: 'M', stock_quantity: 4, sku: 'FN-W-GWN-003-CHG-M' },
      { id: 7, product_id: 3, color: 'Champagne Gold', size: 'L', stock_quantity: 4, sku: 'FN-W-GWN-003-CHG-L' },
      { id: 8, product_id: 4, color: 'Sage Green', size: 'S', stock_quantity: 1, sku: 'FN-W-CRD-004-SGG-S' },
      { id: 9, product_id: 4, color: 'Sage Green', size: 'M', stock_quantity: 2, sku: 'FN-W-CRD-004-SGG-M' },
      { id: 10, product_id: 5, color: 'Peach', size: '4-5 Yrs', stock_quantity: 6, sku: 'FN-K-GIR-001-PCH-45' },
      { id: 11, product_id: 5, color: 'Peach', size: '6-7 Yrs', stock_quantity: 6, sku: 'FN-K-GIR-001-PCH-67' },
      { id: 12, product_id: 6, color: 'Royal Blue', size: '4-5 Yrs', stock_quantity: 9, sku: 'FN-K-BOY-001-RBL-45' },
      { id: 13, product_id: 6, color: 'Royal Blue', size: '6-7 Yrs', stock_quantity: 9, sku: 'FN-K-BOY-001-RBL-67' }
    ],
    wishlists: [],
    wishlist_items: [],
    carts: [],
    cart_items: [],
    addresses: [],
    orders: [],
    order_items: [],
    payments: [],
    coupons: [
      { id: 1, code: 'FASH10', type: 'percentage', discount_value: 10, min_order_amount: 499, max_discount_amount: 200, start_date: '2026-01-01', expiry_date: '2026-12-31', status: 'active' },
      { id: 2, code: 'WELCOME300', type: 'fixed', discount_value: 300, min_order_amount: 1999, max_discount_amount: 300, start_date: '2026-01-01', expiry_date: '2026-12-31', status: 'active' }
    ],
    coupon_usage: [],
    reviews: [],
    returns: [],
    banners: [
      { id: 1, title: 'STYLE THAT FEELS LIKE YOU.', subtitle: 'Discover contemporary women\'s and kids\' fashion designed for every celebration, mood and moment.', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80', link: '/shop', section: 'hero', is_active: 1 },
      { id: 2, title: 'FESTIVE EDIT', subtitle: 'FREE SHIPPING ON ORDERS ABOVE ₹3999', image_url: '', link: '', section: 'announcement', is_active: 1 }
    ],
    newsletter_subscribers: [],
    settings: [
      { id: 1, key: 'store_name', value: 'FASHNORA' },
      { id: 2, key: 'store_email', value: 'support@fashnora.com' },
      { id: 3, key: 'store_phone', value: '+919876543210' },
      { id: 4, key: 'whatsapp_number', value: '+919876543210' },
      { id: 5, key: 'store_address', value: 'Fashnora HQ, Mumbai, India' },
      { id: 6, key: 'gst_information', value: '27AAAAA1111A1Z1' },
      { id: 7, key: 'shipping_charges', value: '99' },
      { id: 8, key: 'free_shipping_threshold', value: '3999' },
      { id: 9, key: 'cod_enabled', value: '1' },
      { id: 10, key: 'cod_min_amount', value: '499' },
      { id: 11, key: 'cod_max_amount', value: '10000' },
      { id: 12, key: 'return_period_days', value: '7' }
    ]
  };

  const dbDir = path.dirname(mockFilePath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  fs.writeFileSync(mockFilePath, JSON.stringify(mockData, null, 2));
  console.log('Mock database seeded and saved.');
}

// Save mock data to disk helper
function saveMockData() {
  fs.writeFileSync(mockFilePath, JSON.stringify(mockData, null, 2));
}

// Connect Database Function
async function connectDb() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fashnora',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  try {
    pool = mysql.createPool(dbConfig);
    // test connection
    const conn = await pool.getConnection();
    conn.release();
    console.log('Successfully connected to MySQL database.');
    isMockMode = false;
  } catch (err) {
    console.warn('MySQL connection failed. Falling back to JSON Mock Database Mode.', err.message);
    isMockMode = true;
    initializeMockDb();
  }
}

// Generic Query Method supporting SQL on MySQL, or JSON data translation
async function query(sql, params = []) {
  if (!pool || isMockMode) {
    return runMockQuery(sql, params);
  }
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (err) {
    console.error('MySQL Query Error:', err.message);
    throw err;
  }
}

// Helper to simulate raw SQL queries on our Mock data
function runMockQuery(sql, params = []) {
  const normalized = sql.replace(/\s+/g, ' ').trim().toLowerCase();
  
  // SELECT ALL SETTINGS
  if (normalized.includes('select * from settings') || normalized.includes('select `key`, `value` from settings')) {
    return mockData.settings;
  }

  // SELECT SETTING BY KEY
  if (normalized.includes('select * from settings where `key` =') || normalized.includes('select value from settings where `key` =')) {
    const key = params[0];
    const match = mockData.settings.find(s => s.key === key);
    return match ? [match] : [];
  }

  // SELECT ALL BANNERS
  if (normalized.includes('select * from banners')) {
    return mockData.banners.filter(b => b.is_active);
  }

  // SELECT CATEGORIES
  if (normalized.includes('select * from categories')) {
    return mockData.categories;
  }

  // SELECT PRODUCTS WITH PRIMARY IMAGES AND CATEGORIES (simplified)
  if (normalized.includes('select p.*') && normalized.includes('from products p')) {
    let prods = [...mockData.products];
    // Attach primary images
    prods = prods.map(p => {
      const img = mockData.product_images.find(i => i.product_id === p.id && i.is_primary);
      const allImgs = mockData.product_images.filter(i => i.product_id === p.id);
      let cat = mockData.categories.find(c => {
        // Simple mapping
        if (p.sku.includes('-W-') && c.slug === 'women-sarees' && (p.sku.includes('SAR') || p.name.toLowerCase().includes('saree'))) return true;
        if (p.sku.includes('-W-') && c.slug === 'women-suits' && (p.sku.includes('KRT') || p.name.toLowerCase().includes('suit') || p.name.toLowerCase().includes('kurti'))) return true;
        if (p.sku.includes('-W-') && c.slug === 'women-gowns' && (p.sku.includes('GWN') || p.name.toLowerCase().includes('gown'))) return true;
        if (p.sku.includes('-W-') && c.slug === 'women-cord-sets' && (p.sku.includes('CRD') || p.name.toLowerCase().includes('cord') || p.name.toLowerCase().includes('co-ord'))) return true;
        if (p.sku.includes('-K-GIR-') && c.slug === 'girls-traditional' && p.sku.includes('GIR-001')) return true;
        if (p.sku.includes('-K-GIR-') && c.slug === 'girls-casual' && p.sku.includes('GIR-002')) return true;
        if (p.sku.includes('-K-BOY-') && c.slug === 'boys-traditional' && p.sku.includes('BOY-001')) return true;
        if (p.sku.includes('-K-BOY-') && c.slug === 'boys-casual' && p.sku.includes('BOY-002')) return true;
        return false;
      });
      if (!cat) {
        if (p.sku.toLowerCase().includes('-w-') || p.name.toLowerCase().includes('women') || p.name.toLowerCase().includes('saree') || p.name.toLowerCase().includes('gown') || p.name.toLowerCase().includes('suit') || p.name.toLowerCase().includes('kurti')) {
          cat = mockData.categories.find(c => c.slug === 'women-suits');
        } else {
          cat = mockData.categories.find(c => c.slug === 'kids-girls');
        }
      }
      return {
        ...p,
        image_url: img ? img.image_url : (allImgs[0] ? allImgs[0].image_url : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'),
        images: allImgs.map(i => i.image_url),
        category_name: cat ? cat.name : 'Uncategorized',
        category_slug: cat ? cat.slug : ''
      };
    });
    return prods;
  }

  // SELECT USER BY EMAIL
  if (normalized.includes('select * from users where email =')) {
    const email = params[0];
    const user = mockData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? [user] : [];
  }

  // SELECT USER BY ID
  if (normalized.includes('select * from users where id =')) {
    const id = parseInt(params[0]);
    const user = mockData.users.find(u => u.id === id);
    return user ? [user] : [];
  }

  // INSERT USER
  if (normalized.includes('insert into users')) {
    const id = mockData.users.length + 1;
    const newUser = {
      id,
      name: params[0],
      email: params[1],
      password_hash: params[2],
      role: params[3] || 'customer',
      phone: params[4] || null,
      status: 'active',
      created_at: new Date().toISOString()
    };
    mockData.users.push(newUser);
    saveMockData();
    return { insertId: id, affectedRows: 1 };
  }

  // SELECT PRODUCT BY SLUG
  if (normalized.includes('where slug =') && normalized.includes('products')) {
    const slug = params[0];
    const prod = mockData.products.find(p => p.slug === slug);
    if (!prod) return [];
    
    // Attach details
    const imgs = mockData.product_images.filter(i => i.product_id === prod.id).map(i => i.image_url);
    const variants = mockData.product_variants.filter(v => v.product_id === prod.id);
    const reviews = mockData.reviews.filter(r => r.product_id === prod.id);
    return [{
      ...prod,
      image_url: imgs[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      images: imgs.length > 0 ? imgs : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
      variants,
      reviews
    }];
  }

  // SELECT PRODUCT BY ID
  if (normalized.includes('where id =') && normalized.includes('products')) {
    const id = parseInt(params[0]);
    const prod = mockData.products.find(p => p.id === id);
    if (!prod) return [];
    
    const imgs = mockData.product_images.filter(i => i.product_id === prod.id).map(i => i.image_url);
    const variants = mockData.product_variants.filter(v => v.product_id === prod.id);
    return [{
      ...prod,
      images: imgs,
      variants
    }];
  }

  // UPDATE SETTINGS
  if (normalized.includes('update settings set value =') || normalized.includes('insert into settings')) {
    // In mock, we can handle store updates
    const key = params[1];
    const value = params[0];
    const idx = mockData.settings.findIndex(s => s.key === key);
    if (idx !== -1) {
      mockData.settings[idx].value = value;
    } else {
      mockData.settings.push({ id: mockData.settings.length + 1, key, value });
    }
    saveMockData();
    return { affectedRows: 1 };
  }

  // SELECT COUPON BY CODE
  if (normalized.includes('select * from coupons where code =')) {
    const code = params[0];
    const coupon = mockData.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.status === 'active');
    return coupon ? [coupon] : [];
  }

  // INSERT ORDER
  if (normalized.includes('insert into orders')) {
    // fields: order_number, user_id, address_id, status, subtotal, discount, shipping, tax, grand_total, payment_method, payment_status
    const id = mockData.orders.length + 1;
    const newOrder = {
      id,
      order_number: params[0],
      user_id: params[1],
      address_id: params[2],
      status: params[3] || 'Pending',
      subtotal: params[4],
      discount: params[5] || 0,
      shipping: params[6] || 0,
      tax: params[7] || 0,
      grand_total: params[8],
      payment_method: params[9],
      payment_status: params[10] || 'Pending',
      created_at: new Date().toISOString()
    };
    mockData.orders.push(newOrder);
    saveMockData();
    return { insertId: id, affectedRows: 1 };
  }

  // INSERT ORDER ITEM
  if (normalized.includes('insert into order_items')) {
    const id = mockData.order_items.length + 1;
    const newItem = {
      id,
      order_id: params[0],
      product_id: params[1],
      variant_id: params[2],
      quantity: params[3],
      price: params[4],
      created_at: new Date().toISOString()
    };
    mockData.order_items.push(newItem);
    saveMockData();
    return { insertId: id, affectedRows: 1 };
  }

  // SELECT ORDERS BY USER ID
  if (normalized.includes('select * from orders where user_id =')) {
    const userId = parseInt(params[0]);
    return mockData.orders.filter(o => o.user_id === userId).sort((a,b) => b.id - a.id);
  }

  // SELECT ORDER BY ORDER NUMBER
  if (normalized.includes('select * from orders where order_number =')) {
    const num = params[0];
    const order = mockData.orders.find(o => o.order_number === num);
    if (!order) return [];
    const items = mockData.order_items.filter(oi => oi.order_id === order.id).map(oi => {
      const prod = mockData.products.find(p => p.id === oi.product_id);
      const vr = mockData.product_variants.find(v => v.id === oi.variant_id);
      return {
        ...oi,
        product_name: prod ? prod.name : 'Unknown Product',
        image_url: mockData.product_images.find(img => img.product_id === oi.product_id)?.image_url || '',
        color: vr ? vr.color : '',
        size: vr ? vr.size : ''
      };
    });
    return [{ ...order, items }];
  }

  // Generic fallback: return empty array to prevent failure
  return [];
}

// Load DB connection on start
connectDb();

module.exports = {
  query,
  isMock: () => isMockMode,
  getMockData: () => mockData,
  saveMockData
};
