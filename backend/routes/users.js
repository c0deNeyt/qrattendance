const express = require('express');
const { body  } = require('express-validator');
const { register, regenerateQr, getUser, getQrCode } = require('../controllers/userController');

const router = express.Router();

router.post('/register',
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body('mobile').optional({ checkFalsy: true }).isMobilePhone('any'),
  register
);

router.post('/regenerate-qr',
  body('contact').trim().notEmpty().withMessage('Email or mobile required'),
  regenerateQr
);

router.get('/:uuid', getUser);

module.exports = router;
