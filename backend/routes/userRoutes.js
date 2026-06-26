const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

router.use(authenticate);

router.get('/', requireAdmin, userController.getAllUsers);
router.put('/:id/status', requireAdmin, userController.updateStatus);
router.put('/:id/role', requireSuperAdmin, userController.promoteRole);
router.delete('/:id', requireAdmin, userController.deleteUser);
router.post('/:id/reset-password', requireAdmin, userController.resetPassword);

module.exports = router;
