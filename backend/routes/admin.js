const express = require('express');
const { authenticate, adminOnly } = require('../middleware/auth');
const { getUsers, getAttendance, exportAttendance, getStats } = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, adminOnly);

router.get('/users',      getUsers);
router.get('/attendance', getAttendance);
router.get('/export',     exportAttendance);
router.get('/stats',      getStats);

module.exports = router;
