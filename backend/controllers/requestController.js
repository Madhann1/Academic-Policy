const Request = require('../models/Request');
const AuditLog = require('../models/AuditLog');

// @desc    Submit a service request
// @route   POST /api/requests
// @access  Faculty
const createRequest = async (req, res) => {
    try {
        const { formType, details } = req.body;

        if (!formType || !details) {
            return res
                .status(400)
                .json({ success: false, message: 'Form type and details are required' });
        }

        const request = await Request.create({
            formType,
            facultyId: req.user._id,
            details,
            status: 'Pending',
        });

        await request.populate('facultyId', 'name email department');

        res.status(201).json({ success: true, request });
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get requests
// @route   GET /api/requests
// @access  Faculty (own) / Admin (all)
const getRequests = async (req, res) => {
    try {
        const { status, formType } = req.query;
        let query = {};

        if (req.user.role === 'faculty') {
            query.facultyId = req.user._id;
        }

        if (status) query.status = status;
        if (formType) query.formType = formType;

        const requests = await Request.find(query)
            .populate('facultyId', 'name email department')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: requests.length, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Faculty (own) / Admin
const getRequestById = async (req, res) => {
    try {
        const request = await Request.findById(req.params.id).populate(
            'facultyId',
            'name email department'
        );

        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        // Faculty can only view their own requests
        if (
            req.user.role === 'faculty' &&
            request.facultyId._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.status(200).json({ success: true, request });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Approve or Reject request
// @route   PUT /api/requests/:id
// @access  Admin
const updateRequestStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res
                .status(400)
                .json({ success: false, message: 'Status must be Approved or Rejected' });
        }

        const request = await Request.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (request.status !== 'Pending') {
            return res
                .status(400)
                .json({ success: false, message: 'Only pending requests can be updated' });
        }

        request.status = status;
        request.remarks = remarks || '';
        await request.save();

        await AuditLog.create({
            action: `${status} service request: ${request.formType}`,
            performedBy: req.user._id,
            targetId: request._id,
            targetModel: 'Request',
            details: remarks || '',
        });

        res.status(200).json({ success: true, message: `Request ${status.toLowerCase()}`, request });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { createRequest, getRequests, getRequestById, updateRequestStatus };
