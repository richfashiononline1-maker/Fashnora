const crypto = require('crypto');
const db = require('../config/db');
const Razorpay = require('razorpay');

let razorpayInstance = null;
try {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (keyId && keySecret && !keyId.includes('placeholder')) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }
} catch (e) {
  console.warn('Razorpay SDK could not initialize. Simulated payment flows will be used.', e.message);
}

const createOrder = async (req, res) => {
  const { items, address, address_id: provided_address_id, coupon_code, payment_method } = req.body;
  const user_id = req.user.id;

  if (!items || items.length === 0 || (!address && !provided_address_id) || !payment_method) {
    return res.status(400).json({ message: 'Missing order details.' });
  }

  try {
    // 1. Fetch products & variants to calculate total and verify stock
    let subtotal = 0;
    const orderItemsToCreate = [];

    const mock = db.isMock();
    const data = mock ? db.getMockData() : null;
    
    let address_id = provided_address_id;
    if (!address_id && address) {
      if (mock) {
        address_id = Math.floor(Math.random() * 1000) + 100;
        data.addresses = data.addresses || [];
        data.addresses.push({ id: address_id, user_id, ...address });
      } else {
        const addressRes = await db.query(
          'INSERT INTO addresses (user_id, name, phone, flat_house, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [user_id, address.name, address.phone, address.flat, address.city, address.state, address.pincode]
        );
        address_id = addressRes.insertId;
      }
    }

    for (const item of items) {
      let product = null;
      let variant = null;

      if (mock) {
        product = data.products.find(p => p.id === item.product_id);
        variant = data.product_variants.find(v => v.id === item.variant_id);
      } else {
        const prods = await db.query('SELECT * FROM products WHERE id = ?', [item.product_id]);
        product = prods[0];
        const vrs = await db.query('SELECT * FROM product_variants WHERE id = ?', [item.variant_id]);
        variant = vrs[0];
      }

      if (!product) {
        return res.status(404).json({ message: `Product not found.` });
      }

      const quantity = parseInt(item.quantity);
      if (variant && variant.stock_quantity < quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name} (${variant.size} - ${variant.color}).` });
      }

      const itemPrice = parseFloat(product.price);
      subtotal += itemPrice * quantity;
      
      orderItemsToCreate.push({
        product_id: product.id,
        variant_id: variant ? variant.id : null,
        quantity,
        price: itemPrice
      });
    }

    // 2. Coupon Validation
    let discount = 0;
    let coupon = null;
    if (coupon_code) {
      const coupons = await db.query('SELECT * FROM coupons WHERE code = ?', [coupon_code]);
      if (coupons.length > 0) {
        coupon = coupons[0];
        // Validate dates & minimum spend
        const now = new Date();
        const start = new Date(coupon.start_date);
        const end = new Date(coupon.expiry_date);
        if (now >= start && now <= end && subtotal >= parseFloat(coupon.min_order_amount)) {
          if (coupon.type === 'percentage') {
            discount = (subtotal * parseFloat(coupon.discount_value)) / 100;
            if (coupon.max_discount_amount) {
              discount = Math.min(discount, parseFloat(coupon.max_discount_amount));
            }
          } else {
            discount = parseFloat(coupon.discount_value);
          }
        }
      }
    }

    // 3. Shipping Calculation
    // Fetch threshold from settings
    let shipping = 99.00;
    let threshold = 999.00;
    
    const settings = await db.query('SELECT * FROM settings WHERE `key` IN ("shipping_charges", "free_shipping_threshold")');
    settings.forEach(s => {
      if (s.key === 'shipping_charges') shipping = parseFloat(s.value);
      if (s.key === 'free_shipping_threshold') threshold = parseFloat(s.value);
    });

    if (subtotal >= threshold) {
      shipping = 0.00;
    }

    const tax = Math.round((subtotal - discount) * 0.05 * 100) / 100; // 5% standard clothing GST
    const grand_total = subtotal - discount + shipping + tax;

    // 4. Create Order entry
    const orderNumber = 'FN-' + Date.now() + Math.floor(Math.random() * 1000);
    const orderStatus = payment_method === 'COD' ? 'Confirmed' : 'Pending';
    const paymentStatus = 'Pending';

    let orderId;
    if (mock) {
      const result = db.query(
        'INSERT INTO orders (order_number, user_id, address_id, status, subtotal, discount, shipping, tax, grand_total, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderNumber, user_id, address_id, orderStatus, subtotal, discount, shipping, tax, grand_total, payment_method, paymentStatus]
      );
      orderId = result.insertId;

      // Create order items
      for (const oitem of orderItemsToCreate) {
        db.query(
          'INSERT INTO order_items (order_id, product_id, variant_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
          [orderId, oitem.product_id, oitem.variant_id, oitem.quantity, oitem.price]
        );
        // Deduct inventory
        const v = data.product_variants.find(pv => pv.id === oitem.variant_id);
        if (v) v.stock_quantity -= oitem.quantity;
      }
      db.saveMockData();
    } else {
      const result = await db.query(
        'INSERT INTO orders (order_number, user_id, address_id, status, subtotal, discount, shipping, tax, grand_total, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderNumber, user_id, address_id, orderStatus, subtotal, discount, shipping, tax, grand_total, payment_method, paymentStatus]
      );
      orderId = result.insertId;

      for (const oitem of orderItemsToCreate) {
        await db.query(
          'INSERT INTO order_items (order_id, product_id, variant_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
          [orderId, oitem.product_id, oitem.variant_id, oitem.quantity, oitem.price]
        );
        // Deduct MySQL stock
        await db.query('UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ?', [oitem.quantity, oitem.variant_id]);
      }
    }

    // 5. Razorpay Integration
    if (payment_method === 'Razorpay') {
      let razorpayOrder = null;
      if (razorpayInstance) {
        try {
          razorpayOrder = await razorpayInstance.orders.create({
            amount: Math.round(grand_total * 100), // in paise
            currency: 'INR',
            receipt: orderNumber
          });
        } catch (err) {
          console.error('Razorpay SDK Order Error:', err.message);
        }
      }

      // If SDK failed or credentials are mock, create simulated Razorpay Order
      if (!razorpayOrder) {
        razorpayOrder = {
          id: 'order_mock_' + Date.now(),
          amount: Math.round(grand_total * 100),
          currency: 'INR',
          receipt: orderNumber,
          simulated: true
        };
      }

      // Store payment metadata
      await db.query(
        'INSERT INTO payments (order_id, razorpay_order_id, status, amount) VALUES (?, ?, "Pending", ?)',
        [orderId, razorpayOrder.id, grand_total]
      );

      return res.json({
        success: true,
        order_number: orderNumber,
        grand_total,
        razorpay_order_id: razorpayOrder.id,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID,
        simulated: razorpayOrder.simulated || false
      });
    }

    // Cash on Delivery
    res.json({
      success: true,
      order_number: orderNumber,
      grand_total,
      message: 'Order placed successfully using COD.'
    });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ message: 'Server error placing order.' });
  }
};

const verifyPayment = async (req, res) => {
  const { order_number, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!order_number || !razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ message: 'Missing payment details.' });
  }

  try {
    const orders = await db.query('SELECT * FROM orders WHERE order_number = ?', [order_number]);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    const order = orders[0];

    // Signature Verification
    let isValid = false;
    const isMockOrder = razorpay_order_id.includes('mock');

    if (isMockOrder) {
      // Auto-validate mocked checkout
      isValid = true;
    } else if (razorpayInstance) {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest('hex');
      isValid = digest === razorpay_signature;
    }

    if (!isValid) {
      return res.status(400).json({ message: 'Payment verification failed.' });
    }

    // Update order status & payment
    if (db.isMock()) {
      const d = db.getMockData();
      const ord = d.orders.find(o => o.order_number === order_number);
      if (ord) {
        ord.status = 'Confirmed';
        ord.payment_status = 'Paid';
      }
      const p = d.payments.find(pay => pay.razorpay_order_id === razorpay_order_id);
      if (p) {
        p.status = 'Paid';
        p.razorpay_payment_id = razorpay_payment_id;
        p.razorpay_signature = razorpay_signature;
      }
      db.saveMockData();
    } else {
      await db.query(
        'UPDATE orders SET status = "Confirmed", payment_status = "Paid" WHERE id = ?',
        [order.id]
      );
      await db.query(
        'UPDATE payments SET status = "Paid", razorpay_payment_id = ?, razorpay_signature = ? WHERE razorpay_order_id = ?',
        [razorpay_payment_id, razorpay_signature, razorpay_order_id]
      );
    }

    res.json({ success: true, message: 'Payment verified and order confirmed.' });
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ message: 'Server error verifying payment.' });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await db.query('SELECT * FROM orders WHERE user_id = ?', [req.user.id]);
    res.json(orders);
  } catch (error) {
    console.error('getOrders error:', error);
    res.status(500).json({ message: 'Server error fetching orders.' });
  }
};

const getOrderByNumber = async (req, res) => {
  const { orderNumber } = req.params;
  try {
    const orders = await db.query('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }
    const order = orders[0];
    if (order.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }
    res.json(order);
  } catch (error) {
    console.error('getOrderByNumber error:', error);
    res.status(500).json({ message: 'Server error fetching order details.' });
  }
};

const requestReturn = async (req, res) => {
  const { order_id, product_id, reason, description } = req.body;

  if (!order_id || !product_id || !reason) {
    return res.status(400).json({ message: 'Missing return parameters.' });
  }

  try {
    if (db.isMock()) {
      const data = db.getMockData();
      const order = data.orders.find(o => o.id === parseInt(order_id));
      if (!order) return res.status(404).json({ message: 'Order not found.' });
      
      const id = data.returns.length + 1;
      data.returns.push({
        id,
        order_id: parseInt(order_id),
        product_id: parseInt(product_id),
        reason,
        description,
        status: 'Pending',
        refund_status: 'Pending',
        created_at: new Date().toISOString()
      });
      order.status = 'Return Requested';
      db.saveMockData();
    } else {
      await db.query(
        'INSERT INTO returns (order_id, product_id, reason, description, status, refund_status) VALUES (?, ?, ?, ?, "Pending", "Pending")',
        [order_id, product_id, reason, description]
      );
      await db.query('UPDATE orders SET status = "Return Requested" WHERE id = ?', [order_id]);
    }
    res.json({ success: true, message: 'Return request submitted successfully.' });
  } catch (error) {
    console.error('requestReturn error:', error);
    res.status(500).json({ message: 'Server error requesting return.' });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getOrders,
  getOrderByNumber,
  requestReturn
};
