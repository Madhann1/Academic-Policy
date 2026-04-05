const express = require('express');
const router = express.Router();
const { getAdminDashboard, getFacultyDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

router.get('/admin', protect, authorizeRoles('admin'), getAdminDashboard);
router.get('/faculty', protect, authorizeRoles('faculty'), getFacultyDashboard);

module.exports = router;
