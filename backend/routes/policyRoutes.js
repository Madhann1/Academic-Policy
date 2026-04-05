const express = require('express');
const router = express.Router();
const {
    createPolicy,
    getPolicies,
    getPolicyById,
    updatePolicy,
    submitPolicy,
    approvePolicy,
    rejectPolicy,
    archivePolicy,
    getPolicyHistory,
} = require('../controllers/policyController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const upload = require('../middleware/upload');

router.use(protect);

// All roles can list/view
router.get('/', getPolicies);
router.get('/:id', getPolicyById);
router.get('/:id/history', getPolicyById); // Will reuse for history

// Faculty only
router.post('/', authorizeRoles('faculty'), upload.single('file'), createPolicy);
router.put('/:id', authorizeRoles('faculty'), upload.single('file'), updatePolicy);
router.put('/:id/submit', authorizeRoles('faculty'), submitPolicy);

// Admin and HOD
router.put('/:id/approve', authorizeRoles('admin', 'hod'), approvePolicy);
router.put('/:id/reject', authorizeRoles('admin', 'hod'), rejectPolicy);
router.delete('/:id', authorizeRoles('admin'), archivePolicy);
router.get('/:id/history', authorizeRoles('admin', 'hod', 'faculty'), getPolicyHistory);

module.exports = router;
