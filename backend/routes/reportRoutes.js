const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);

router.get('/attendance', requireAdmin, reportController.getAttendanceReport);

module.exports = router;
