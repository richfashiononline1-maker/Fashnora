const db = require('../config/db');

const getProducts = async (req, res) => {
  try {
    // Fetch products (database helper automatically attaches primary image, category details)
    let products = await db.query(`
      SELECT p.*, 
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS image_url 
      FROM products p
    `);

    // Add fallback for category_slug if missing (when using real MySQL)
    products = products.map(p => {
      let cat_slug = p.category_slug;
      if (!cat_slug) {
        if (p.sku.includes('-W-')) cat_slug = 'women-suits';
        else cat_slug = 'kids-girls';
      }
      return { ...p, category_slug: cat_slug };
    });

    // Filter by active status
    products = products.filter(p => p.status === 'active');

    // Destructure query parameters
    const { category, subcategory, size, color, fabric, occasion, priceMin, priceMax, search, sort, isBestseller, isNewArrival, isSale } = req.query;

    // Apply category filters
    if (category) {
      const catVal = category.toLowerCase();
      if (catVal === 'women') {
        products = products.filter(p => p.sku.includes('-W-') || p.category_slug.startsWith('women-'));
      } else if (catVal === 'kids') {
        products = products.filter(p => p.sku.includes('-K-') || p.category_slug.startsWith('kids-') || p.category_slug.startsWith('girls-') || p.category_slug.startsWith('boys-'));
      } else {
        products = products.filter(p => p.category_slug === catVal || (p.category_name && p.category_name.toLowerCase() === catVal));
      }
    }

    if (subcategory) {
      const subVal = subcategory.toLowerCase();
      // Look up subcategory
      products = products.filter(p => p.category_slug === subVal);
    }

    // Filter by price range
    if (priceMin) {
      products = products.filter(p => p.price >= parseFloat(priceMin));
    }
    if (priceMax) {
      products = products.filter(p => p.price <= parseFloat(priceMax));
    }

    // Filter by size/color (requires checking variants)
    const mock = db.isMock();
    let variants = [];
    if (mock) {
      variants = db.getMockData().product_variants;
    } else {
      variants = await db.query('SELECT * FROM product_variants');
    }

    if (size) {
      const sizes = size.split(',');
      products = products.filter(p => {
        const prodVariants = variants.filter(v => v.product_id === p.id);
        return prodVariants.some(v => sizes.includes(v.size));
      });
    }

    if (color) {
      const colors = color.split(',').map(c => c.toLowerCase());
      products = products.filter(p => {
        const prodVariants = variants.filter(v => v.product_id === p.id);
        return prodVariants.some(v => colors.includes(v.color.toLowerCase()));
      });
    }

    // Fabric filter
    if (fabric) {
      const fabrics = fabric.split(',').map(f => f.toLowerCase());
      products = products.filter(p => p.fabric && fabrics.includes(p.fabric.toLowerCase()));
    }

    // Occasion filter
    if (occasion) {
      const occasions = occasion.split(',').map(o => o.toLowerCase());
      products = products.filter(p => p.occasion && occasions.includes(p.occasion.toLowerCase()));
    }

    // Badges filters
    if (isBestseller === 'true') {
      products = products.filter(p => p.is_bestseller);
    }
    if (isNewArrival === 'true') {
      products = products.filter(p => p.is_new_arrival);
    }
    if (isSale === 'true') {
      products = products.filter(p => p.is_sale);
    }

    // Search filter (handles name, description, SKU, tags, category)
    if (search) {
      const queryStr = search.toLowerCase();
      products = products.filter(p => {
        return (
          p.name.toLowerCase().includes(queryStr) ||
          (p.description && p.description.toLowerCase().includes(queryStr)) ||
          p.sku.toLowerCase().includes(queryStr) ||
          (p.fabric && p.fabric.toLowerCase().includes(queryStr)) ||
          (p.occasion && p.occasion.toLowerCase().includes(queryStr)) ||
          (p.category_name && p.category_name.toLowerCase().includes(queryStr))
        );
      });
    }

    // Sort options
    // 'featured', 'newest', 'price-low', 'price-high', 'bestselling', 'rating'
    if (sort) {
      switch (sort) {
        case 'newest':
          products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'price-low':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          products.sort((a, b) => b.price - a.price);
          break;
        case 'bestselling':
          products.sort((a, b) => b.is_bestseller - a.is_bestseller);
          break;
        case 'rating':
          // Mock or real average ratings
          break;
        default:
          break;
      }
    }

    res.json(products);
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ message: 'Server error fetching products.' });
  }
};

const getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const products = await db.query('SELECT * FROM products WHERE slug = ?', [slug]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(products[0]);
  } catch (error) {
    console.error('getProductBySlug error:', error);
    res.status(500).json({ message: 'Server error fetching product.' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM categories');
    res.json(categories);
  } catch (error) {
    console.error('getCategories error:', error);
    res.status(500).json({ message: 'Server error fetching categories.' });
  }
};

const getBanners = async (req, res) => {
  try {
    const banners = await db.query('SELECT * FROM banners');
    res.json(banners);
  } catch (error) {
    console.error('getBanners error:', error);
    res.status(500).json({ message: 'Server error fetching banners.' });
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await db.query('SELECT * FROM settings');
    // Map settings array to a key-value object
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json(settingsObj);
  } catch (error) {
    console.error('getSettings error:', error);
    res.status(500).json({ message: 'Server error fetching settings.' });
  }
};

const getReviews = async (req, res) => {
  const { productId } = req.params;
  try {
    let reviews = [];
    if (db.isMock()) {
      reviews = db.getMockData().reviews.filter(r => r.product_id === parseInt(productId) && r.status === 'Approved');
      // Enrich with user name
      reviews = reviews.map(r => {
        const user = db.getMockData().users.find(u => u.id === r.user_id);
        return { ...r, user_name: user ? user.name : 'Verified Customer' };
      });
    } else {
      reviews = await db.query(
        'SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? AND r.status = "Approved"',
        [productId]
      );
    }
    res.json(reviews);
  } catch (error) {
    console.error('getReviews error:', error);
    res.status(500).json({ message: 'Server error fetching reviews.' });
  }
};

const submitReview = async (req, res) => {
  const { product_id, rating, review_text } = req.body;
  const user_id = req.user.id;

  if (!product_id || !rating) {
    return res.status(400).json({ message: 'Product ID and star rating are required.' });
  }

  try {
    if (db.isMock()) {
      const rdata = db.getMockData();
      const id = rdata.reviews.length + 1;
      const isVerified = rdata.orders.some(o => o.user_id === user_id && o.status === 'Delivered');
      rdata.reviews.push({
        id,
        product_id: parseInt(product_id),
        user_id,
        rating: parseInt(rating),
        review_text,
        is_verified: isVerified ? 1 : 0,
        is_featured: 0,
        status: 'Approved', // Auto-approved for simple experience
        created_at: new Date().toISOString()
      });
      db.saveMockData();
    } else {
      // Check orders for verified purchase
      const orders = await db.query(
        'SELECT o.id FROM orders o JOIN order_items oi ON o.id = oi.order_id WHERE o.user_id = ? AND oi.product_id = ? AND o.status = "Delivered"',
        [user_id, product_id]
      );
      const isVerified = orders.length > 0;

      await db.query(
        'INSERT INTO reviews (product_id, user_id, rating, review_text, is_verified, status) VALUES (?, ?, ?, ?, ?, "Approved")',
        [product_id, user_id, rating, review_text, isVerified]
      );
    }
    res.status(201).json({ message: 'Review submitted successfully.' });
  } catch (error) {
    console.error('submitReview error:', error);
    res.status(500).json({ message: 'Server error submitting review.' });
  }
};

const getStyleFinderRecommendations = async (req, res) => {
  const { occasion } = req.query;
  try {
    let products = await db.query('SELECT p.* FROM products p');
    products = products.filter(p => p.status === 'active');

    if (occasion) {
      products = products.filter(p => p.occasion && p.occasion.toLowerCase().includes(occasion.toLowerCase()));
    }
    res.json(products.slice(0, 4));
  } catch (error) {
    console.error('Style Finder error:', error);
    res.status(500).json({ message: 'Server error fetching recommendations.' });
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  getCategories,
  getBanners,
  getSettings,
  getReviews,
  submitReview,
  getStyleFinderRecommendations
};
