require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  };

  console.log('Connecting to MySQL Server...', { host: config.host, user: config.user });
  
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connected to MySQL server.');
  } catch (error) {
    console.error('MySQL connection failed. Please ensure MySQL is running and your credentials in .env are correct.', error.message);
    process.exit(1);
  }

  // Create database
  const dbName = process.env.DB_NAME || 'fashnora';
  console.log(`Ensuring database "${dbName}" exists...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  await connection.query(`USE \`${dbName}\`;`);

  // Read and execute schema
  console.log('Executing schema.sql...');
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  
  // Split schema by semicolon to run queries individually
  // Note: Simple split by semicolon. Be careful not to use semicolons inside comments or strings.
  const queries = schemaSql
    .split(/;\s*$/m)
    .map(q => q.trim())
    .filter(q => q.length > 0);

  for (const query of queries) {
    try {
      await connection.query(query);
    } catch (err) {
      console.error('Error executing query:', query.substring(0, 100));
      console.error(err.message);
    }
  }
  console.log('Database tables verified/created successfully.');

  // Seed default admin
  const adminEmail = 'admin@fashnora.com';
  const [existingAdmin] = await connection.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
  if (existingAdmin.length === 0) {
    console.log('Seeding admin user...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await connection.query(
      'INSERT INTO users (name, email, password_hash, role, phone, status) VALUES (?, ?, ?, ?, ?, ?)',
      ['Fashnora Admin', adminEmail, adminPasswordHash, 'admin', '+919999999999', 'active']
    );
    console.log('Admin user seeded (Email: admin@fashnora.com, Password: admin123).');
  }

  // Seed default categories
  const categoriesToSeed = [
    // Women subcategories
    { name: 'Cord Sets', slug: 'women-cord-sets', gender: 'women', parent_slug: null },
    { name: 'Suits', slug: 'women-suits', gender: 'women', parent_slug: null },
    { name: 'Indo-Western', slug: 'women-indo-western', gender: 'women', parent_slug: null },
    { name: 'Kurtis', slug: 'women-kurtis', gender: 'women', parent_slug: null },
    { name: 'Gowns', slug: 'women-gowns', gender: 'women', parent_slug: null },
    { name: 'Sarees', slug: 'women-sarees', gender: 'women', parent_slug: null },
    { name: 'Tops', slug: 'women-tops', gender: 'women', parent_slug: null },
    // Kids
    { name: 'Girls', slug: 'kids-girls', gender: 'kids', parent_slug: null },
    { name: 'Boys', slug: 'kids-boys', gender: 'kids', parent_slug: null },
    // Sub-categories under Girls
    { name: 'Western Outfits', slug: 'girls-western', gender: 'kids', parent_slug: 'kids-girls' },
    { name: 'Cord Sets', slug: 'girls-cord-sets', gender: 'kids', parent_slug: 'kids-girls' },
    { name: 'Traditional Wear', slug: 'girls-traditional', gender: 'kids', parent_slug: 'kids-girls' },
    { name: 'Casual Wear', slug: 'girls-casual', gender: 'kids', parent_slug: 'kids-girls' },
    // Sub-categories under Boys
    { name: 'Western Wear', slug: 'boys-western', gender: 'kids', parent_slug: 'kids-boys' },
    { name: 'Traditional Wear', slug: 'boys-traditional', gender: 'kids', parent_slug: 'kids-boys' },
    { name: 'Casual Wear', slug: 'boys-casual', gender: 'kids', parent_slug: 'kids-boys' },
    { name: 'Party Wear', slug: 'boys-party', gender: 'kids', parent_slug: 'kids-boys' }
  ];

  console.log('Seeding categories...');
  for (const cat of categoriesToSeed) {
    const [exists] = await connection.query('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
    if (exists.length === 0) {
      let parentId = null;
      if (cat.parent_slug) {
        const [parent] = await connection.query('SELECT id FROM categories WHERE slug = ?', [cat.parent_slug]);
        if (parent.length > 0) parentId = parent[0].id;
      }
      await connection.query(
        'INSERT INTO categories (name, slug, image_url, parent_id, gender) VALUES (?, ?, ?, ?, ?)',
        [cat.name, cat.slug, '', parentId, cat.gender]
      );
    }
  }

  // Seed default settings
  const defaultSettings = {
    store_name: 'FASHNORA',
    store_email: 'support@fashnora.com',
    store_phone: '+919876543210',
    whatsapp_number: '+919876543210',
    store_address: 'Fashnora HQ, Fashion Boulevard, Mumbai, India',
    gst_information: '27AAAAA1111A1Z1',
    shipping_charges: '99',
    free_shipping_threshold: '999',
    cod_enabled: '1',
    cod_min_amount: '499',
    cod_max_amount: '10000',
    return_period_days: '7'
  };

  console.log('Seeding store settings...');
  for (const [key, value] of Object.entries(defaultSettings)) {
    const [exists] = await connection.query('SELECT id FROM settings WHERE `key` = ?', [key]);
    if (exists.length === 0) {
      await connection.query('INSERT INTO settings (`key`, `value`) VALUES (?, ?)', [key, value]);
    }
  }

  // Seed default banners
  const defaultBanners = [
    { title: 'STYLE THAT FEELS LIKE YOU.', subtitle: 'Discover contemporary women\'s and kids\' fashion designed for every celebration, mood and moment.', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1600&q=80', link: '/shop', section: 'hero' },
    { title: 'FESTIVE ANNOUNCEMENT', subtitle: 'FREE SHIPPING ON ORDERS ABOVE ₹999', image_url: '', link: '', section: 'announcement' }
  ];

  console.log('Seeding homepage banners...');
  for (const banner of defaultBanners) {
    const [exists] = await connection.query('SELECT id FROM banners WHERE title = ? AND section = ?', [banner.title, banner.section]);
    if (exists.length === 0) {
      await connection.query(
        'INSERT INTO banners (title, subtitle, image_url, link, section, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [banner.title, banner.subtitle, banner.image_url, banner.link, banner.section, true]
      );
    }
  }

  // Seed default coupons
  const defaultCoupons = [
    { code: 'FASH10', type: 'percentage', discount_value: '10', min_order_amount: '499', max_discount_amount: '200', start_date: '2026-01-01', expiry_date: '2026-12-31' },
    { code: 'WELCOME300', type: 'fixed', discount_value: '300', min_order_amount: '1999', max_discount_amount: '300', start_date: '2026-01-01', expiry_date: '2026-12-31' }
  ];

  console.log('Seeding discount coupons...');
  for (const coupon of defaultCoupons) {
    const [exists] = await connection.query('SELECT id FROM coupons WHERE code = ?', [coupon.code]);
    if (exists.length === 0) {
      await connection.query(
        'INSERT INTO coupons (code, type, discount_value, min_order_amount, max_discount_amount, start_date, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [coupon.code, coupon.type, coupon.discount_value, coupon.min_order_amount, coupon.max_discount_amount, coupon.start_date, coupon.expiry_date]
      );
    }
  }

  // Seed Demo Products
  // We need products for women (sarees, kurtis, gowns, cord sets) and kids (girls, boys)
  const productsToSeed = [
    {
      name: 'Elysian Burgundy Georgette Saree',
      sku: 'FN-W-SAR-001',
      category_slug: 'women-sarees',
      price: 2499.00,
      mrp: 4999.00,
      discount: 50,
      fabric: 'Premium Georgette',
      occasion: 'Festive Wear',
      care_instructions: 'Dry clean only. Store in a clean muslin cloth.',
      description: 'An elegant burgundy georgette saree featuring delicate sequin borders and hand-embellished details. Perfect for wedding guests and celebratory gatherings.',
      stock_quantity: 15,
      is_new_arrival: true,
      is_bestseller: true,
      is_sale: true,
      colors: ['Burgundy', 'Wine'],
      sizes: ['Free Size'],
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      name: 'Ivory Floral Printed Kurti Suit Set',
      sku: 'FN-W-KRT-002',
      category_slug: 'women-suits',
      price: 1899.00,
      mrp: 2999.00,
      discount: 37,
      fabric: 'Pure Cotton Lurex',
      occasion: 'Casual Wear',
      care_instructions: 'Hand wash separately in cold water with mild detergent.',
      description: 'A beautiful ivory-colored A-line kurti set accented with floral motifs and matching palazzo trousers, accompanied by a lightweight dupatta.',
      stock_quantity: 22,
      is_new_arrival: true,
      is_bestseller: false,
      is_sale: true,
      colors: ['Ivory', 'Blush Pink'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: [
        'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      name: 'Champagne Gold Embellished Indo-Western Gown',
      sku: 'FN-W-GWN-003',
      category_slug: 'women-gowns',
      price: 4500.00,
      mrp: 8999.00,
      discount: 50,
      fabric: 'Premium Silk & Net',
      occasion: 'Party Wear',
      care_instructions: 'Dry clean only.',
      description: 'Make a statement at any evening gala with this flowing champagne gold Indo-Western gown decorated with intricate metallic embroidery and beads.',
      stock_quantity: 8,
      is_new_arrival: false,
      is_bestseller: true,
      is_sale: false,
      colors: ['Champagne Gold', 'Muted Gold'],
      sizes: ['S', 'M', 'L', 'XL'],
      images: [
        'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      name: 'Sage Green Linen Casual Co-ord Set',
      sku: 'FN-W-CRD-004',
      category_slug: 'women-cord-sets',
      price: 1599.00,
      mrp: 2499.00,
      discount: 36,
      fabric: '100% Breathable Linen',
      occasion: 'Everyday Style',
      care_instructions: 'Gentle machine wash with like colors.',
      description: 'An easy-breezy co-ord set featuring a button-down linen shirt and high-waisted relaxed-fit trousers. Perfect for weekend outings or office casual days.',
      stock_quantity: 3, // Low stock test case
      is_new_arrival: true,
      is_bestseller: false,
      is_sale: false,
      colors: ['Sage Green', 'Beige'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      images: [
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      name: 'Peach Blossom Girls traditional Lehenga Choli',
      sku: 'FN-K-GIR-001',
      category_slug: 'girls-traditional',
      price: 2199.00,
      mrp: 3999.00,
      discount: 45,
      fabric: 'Art Silk and Organza',
      occasion: 'Festive Wear',
      care_instructions: 'Dry clean only.',
      description: 'Let your little girl shine in this vibrant peach-colored lehenga choli set, featuring a soft organza dupatta and traditional gold foil print details.',
      stock_quantity: 12,
      is_new_arrival: true,
      is_bestseller: true,
      is_sale: true,
      colors: ['Peach', 'Blush Pink'],
      sizes: ['2-3 Yrs', '4-5 Yrs', '6-7 Yrs', '8-9 Yrs', '10-11 Yrs'],
      images: [
        'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1471286174243-e85af6f9bcd9?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      name: 'Royal Blue Boys Kurta & Nehru Jacket Set',
      sku: 'FN-K-BOY-001',
      category_slug: 'boys-traditional',
      price: 1799.00,
      mrp: 2999.00,
      discount: 40,
      fabric: 'Cotton Silk Blend',
      occasion: 'Wedding Guest',
      care_instructions: 'Gentle hand wash separately.',
      description: 'A handsome royal blue traditional kurta set for boys, paired with pyjamas and a beautifully printed Nehru jacket to complete the dapper look.',
      stock_quantity: 18,
      is_new_arrival: false,
      is_bestseller: true,
      is_sale: false,
      colors: ['Royal Blue', 'Maroon'],
      sizes: ['2-3 Yrs', '4-5 Yrs', '6-7 Yrs', '8-9 Yrs'],
      images: [
        'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      name: 'Girls Denim Overalls & Tee Casual Set',
      sku: 'FN-K-GIR-002',
      category_slug: 'girls-casual',
      price: 1299.00,
      mrp: 1999.00,
      discount: 35,
      fabric: 'Soft Stretch Cotton Denim',
      occasion: 'Everyday Style',
      care_instructions: 'Machine wash warm.',
      description: 'A stylish and highly durable casual outfit featuring blue denim dungaree overalls with adjustable straps and a comfortable striped cotton tee.',
      stock_quantity: 30,
      is_new_arrival: true,
      is_bestseller: false,
      is_sale: false,
      colors: ['Blue Denim'],
      sizes: ['2-3 Yrs', '4-5 Yrs', '6-7 Yrs', '8-9 Yrs'],
      images: [
        'https://images.unsplash.com/photo-1540822512574-cde3783eedb0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      name: 'Boys Smart Casual Linen Shirt & Chinos',
      sku: 'FN-K-BOY-002',
      category_slug: 'boys-casual',
      price: 1499.00,
      mrp: 2499.00,
      discount: 40,
      fabric: 'Linen Blend & Cotton',
      occasion: 'Everyday Style',
      care_instructions: 'Wash dark colors separately. Iron if needed.',
      description: 'A modern, premium casual co-ord set for boys. Features a breathable linen shirt in soft olive green and comfortable beige cotton chinos.',
      stock_quantity: 14,
      is_new_arrival: true,
      is_bestseller: false,
      is_sale: true,
      colors: ['Olive Green', 'Sky Blue'],
      sizes: ['2-3 Yrs', '4-5 Yrs', '6-7 Yrs', '8-9 Yrs', '10-11 Yrs'],
      images: [
        'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=800&q=80'
      ]
    }
  ];

  console.log('Seeding products and variants...');
  for (const prod of productsToSeed) {
    const [exists] = await connection.query('SELECT id FROM products WHERE sku = ?', [prod.sku]);
    let productId;
    if (exists.length === 0) {
      // Find category ID
      const [cat] = await connection.query('SELECT id FROM categories WHERE slug = ?', [prod.category_slug]);
      if (cat.length === 0) {
        console.warn(`Category slug "${prod.category_slug}" not found for product "${prod.name}". Skipping.`);
        continue;
      }
      const categoryId = cat[0].id;

      // Insert product
      const [insertRes] = await connection.query(
        `INSERT INTO products 
        (name, slug, sku, description, price, mrp, discount, fabric, occasion, care_instructions, stock_quantity, is_bestseller, is_new_arrival, is_sale, seo_title, seo_description) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prod.name,
          prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          prod.sku,
          prod.description,
          prod.price,
          prod.mrp,
          prod.discount,
          prod.fabric,
          prod.occasion,
          prod.care_instructions,
          prod.stock_quantity,
          prod.is_bestseller,
          prod.is_new_arrival,
          prod.is_sale,
          `${prod.name} | Fashnora`,
          prod.description.substring(0, 150)
        ]
      );
      productId = insertRes.insertId;

      // Insert images
      for (let i = 0; i < prod.images.length; i++) {
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
          [productId, prod.images[i], i === 0]
        );
      }

      // Insert variants (combinations of color and size)
      for (const color of prod.colors) {
        for (const size of prod.sizes) {
          await connection.query(
            'INSERT INTO product_variants (product_id, color, size, stock_quantity, sku) VALUES (?, ?, ?, ?, ?)',
            [productId, color, size, Math.floor(prod.stock_quantity / (prod.colors.length * prod.sizes.length)) || 5, `${prod.sku}-${color.substring(0,3).toUpperCase()}-${size.replace(/[^A-Za-z0-9]/g, '')}`]
          );
        }
      }
    }
  }

  console.log('Seeding completed successfully.');
  await connection.end();
}

initializeDatabase().catch(err => {
  console.error('Initialization failed:', err);
  process.exit(1);
});
