const express = require('express');
const router = express.Router();
const { getAcademicInfo, updateAcademicInfo } = require('../controllers/academicInfoController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

router.use(protect);

// All authenticated roles can view
router.get('/', getAcademicInfo);

// Admin only can update
router.put('/', authorizeRoles('admin'), updateAcademicInfo);

module.exports = router;
