const { body, validationResult } = require('express-validator');

const name = body('name').trim().isLength({ min: 20, max: 60 }).withMessage('Name must be 20-60 characters');
const email = body('email').trim().isEmail().withMessage('Invalid email').normalizeEmail();
const address = body('address').optional({ nullable: true }).isLength({ max: 400 }).withMessage('Address max 400 characters');
const strongPassword = (field = 'password') =>
  body(field).isLength({ min: 8, max: 16 }).withMessage('Password must be 8-16 characters')
    .matches(/[A-Z]/).withMessage('Password needs one uppercase letter')
    .matches(/[^A-Za-z0-9]/).withMessage('Password needs one special character');

const handle = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  next();
};

exports.signup = [name, email, address, strongPassword(), handle];
exports.createUser = [name, email, address, strongPassword(), body('role').isIn(['ADMIN', 'USER', 'OWNER']), handle];
exports.createStore = [
  body('name').trim().notEmpty().withMessage('Store name required'), email,
  body('address').isLength({ min: 1, max: 400 }).withMessage('Address required (max 400 characters)'),
  body('ownerId').optional({ nullable: true, checkFalsy: true }).isInt(), handle,
];
exports.login = [email, body('password').notEmpty(), handle];
exports.updatePassword = [body('currentPassword').notEmpty(), strongPassword('newPassword'), handle];
exports.rating = [body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'), handle];
