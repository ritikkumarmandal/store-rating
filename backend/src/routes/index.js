const router = require('express').Router();
const v = require('../utils/validators');
const { authenticate, authorize } = require('../middleware/auth');
const auth = require('../controllers/authController');
const admin = require('../controllers/adminController');
const user = require('../controllers/userController');
const owner = require('../controllers/ownerController');

router.post('/auth/signup', v.signup, auth.signup);
router.post('/auth/login', v.login, auth.login);
router.put('/auth/password', authenticate, v.updatePassword, auth.updatePassword);

router.use('/admin', authenticate, authorize('ADMIN'));
router.get('/admin/dashboard', admin.dashboard);
router.get('/admin/users', admin.listUsers);
router.get('/admin/users/:id', admin.getUser);
router.post('/admin/users', v.createUser, admin.createUser);
router.get('/admin/stores', admin.listStores);
router.post('/admin/stores', v.createStore, admin.createStore);

router.get('/stores', authenticate, authorize('USER'), user.listStores);
router.put('/stores/:storeId/rating', authenticate, authorize('USER'), v.rating, user.rateStore);

router.get('/owner/dashboard', authenticate, authorize('OWNER'), owner.dashboard);

module.exports = router;
