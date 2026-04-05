const express = require('express');
const router = express.Router();
const {
    createRequest,
    getRequests,
    getRequestById,
    updateRequestStatus,
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

router.use(protect);

router.get('/', authorizeRoles('faculty', 'admin'), getRequests);
router.get('/:id', authorizeRoles('faculty', 'admin'), getRequestById);
router.post('/', authorizeRoles('faculty'), createRequest);
router.put('/:id', authorizeRoles('admin'), updateRequestStatus);

module.exports = router;
