const express = require('express');
const router = express.Router();

const { verifyToken, isAdmin } = require('../middleware/auth');
const authCtrl = require('../controllers/authController');
const prodCtrl = require('../controllers/productController');
const orderCtrl = require('../controllers/orderController');
const adminCtrl = require('../controllers/adminController');

// 1. Authentication Routes
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/profile', verifyToken, authCtrl.getProfile);

// 2. Product Catalog Routes
router.get('/products', prodCtrl.getProducts);
router.get('/products/slug/:slug', prodCtrl.getProductBySlug);
router.get('/products/style-finder', prodCtrl.getStyleFinderRecommendations);
router.get('/categories', prodCtrl.getCategories);
router.get('/banners', prodCtrl.getBanners);
router.get('/settings', prodCtrl.getSettings);

// 3. Reviews Routes
router.get('/reviews/:productId', prodCtrl.getReviews);
router.post('/reviews', verifyToken, prodCtrl.submitReview);

// 4. Shopping Cart & Checkout Routes
router.post('/orders', verifyToken, orderCtrl.createOrder);
router.post('/orders/verify', verifyToken, orderCtrl.verifyPayment);
router.get('/orders/my-orders', verifyToken, orderCtrl.getOrders);
router.get('/orders/track/:orderNumber', verifyToken, orderCtrl.getOrderByNumber);
router.post('/orders/return', verifyToken, orderCtrl.requestReturn);

// 5. Admin Dashboard Routes
router.get('/admin/analytics', verifyToken, isAdmin, adminCtrl.getAnalytics);
router.put('/admin/settings', verifyToken, isAdmin, adminCtrl.updateStoreSettings);
router.put('/admin/announcement', verifyToken, isAdmin, adminCtrl.adminUpdateBanner);
router.get('/admin/products', verifyToken, isAdmin, adminCtrl.adminGetProducts);
router.post('/admin/products', verifyToken, isAdmin, adminCtrl.adminCreateProduct);
router.put('/admin/products/:id', verifyToken, isAdmin, adminCtrl.adminUpdateProduct);
router.delete('/admin/products/:id', verifyToken, isAdmin, adminCtrl.adminDeleteProduct);
router.get('/admin/orders', verifyToken, isAdmin, adminCtrl.adminGetOrders);
router.put('/admin/orders/:id/status', verifyToken, isAdmin, adminCtrl.adminUpdateOrderStatus);
router.get('/admin/customers', verifyToken, isAdmin, adminCtrl.adminGetCustomers);
router.get('/admin/returns', verifyToken, isAdmin, adminCtrl.adminGetReturns);
router.put('/admin/returns/:id/status', verifyToken, isAdmin, adminCtrl.adminUpdateReturnStatus);
router.get('/admin/coupons', verifyToken, isAdmin, adminCtrl.adminGetCoupons);
router.post('/admin/coupons', verifyToken, isAdmin, adminCtrl.adminCreateCoupon);

module.exports = router;
