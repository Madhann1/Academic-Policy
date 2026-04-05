const Policy = require('../models/Policy');
const AuditLog = require('../models/AuditLog');
const path = require('path');

// @desc    Create policy (draft)
// @route   POST /api/policies
// @access  Faculty
const createPolicy = async (req, res) => {
    try {
        const { title, description, category } = req.body;

        if (!title || !description || !category) {
            return res
                .status(400)
                .json({ success: false, message: 'Title, description and category are required' });
        }

        const policyData = {
            title,
            description,
            category,
            createdBy: req.user._id,
            status: 'Draft',
            version: 1,
        };

        if (req.file) {
            policyData.fileUrl = `/uploads/${req.file.filename}`;
        }

        const policy = await Policy.create(policyData);
        await policy.populate('createdBy', 'name email');

        res.status(201).json({ success: true, policy });
    } catch (error) {
        console.error('Create policy error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all policies (role-filtered)
// @route   GET /api/policies
// @access  Protected
const getPolicies = async (req, res) => {
    try {
        const { category, status, search } = req.query;
        let query = { isArchived: false };

        // Students can only see approved policies
        if (req.user.role === 'student') {
            query.status = 'Approved';
        }
        // Faculty see only their own policies
        else if (req.user.role === 'faculty') {
            query.createdBy = req.user._id;
        }

        if (category) query.category = category;
        if (status && req.user.role !== 'student') query.status = status;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const policies = await Policy.find(query)
            .populate('createdBy', 'name email department')
            .populate('approvedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: policies.length, policies });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single policy
// @route   GET /api/policies/:id
// @access  Protected
const getPolicyById = async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id)
            .populate('createdBy', 'name email department')
            .populate('approvedBy', 'name email');

        if (!policy) {
            return res.status(404).json({ success: false, message: 'Policy not found' });
        }

        // Students can only see approved policies
        if (req.user.role === 'student' && policy.status !== 'Approved') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Faculty can only see their own policies
        if (
            req.user.role === 'faculty' &&
            policy.createdBy._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.status(200).json({ success: true, policy });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update policy (only Draft status)
// @route   PUT /api/policies/:id
// @access  Faculty (own policies)
const updatePolicy = async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            return res.status(404).json({ success: false, message: 'Policy not found' });
        }

        if (policy.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (policy.status !== 'Draft' && policy.status !== 'Rejected') {
            return res
                .status(400)
                .json({ success: false, message: 'Policy can only be edited in Draft or Rejected status' });
        }

        const { title, description, category } = req.body;
        if (title) policy.title = title;
        if (description) policy.description = description;
        if (category) policy.category = category;
        if (req.file) policy.fileUrl = `/uploads/${req.file.filename}`;
        if (policy.status === 'Rejected') policy.status = 'Draft';

        await policy.save();
        await policy.populate('createdBy', 'name email');

        res.status(200).json({ success: true, policy });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Submit policy for approval
// @route   PUT /api/policies/:id/submit
// @access  Faculty
const submitPolicy = async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            return res.status(404).json({ success: false, message: 'Policy not found' });
        }

        if (policy.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (policy.status !== 'Draft') {
            return res
                .status(400)
                .json({ success: false, message: 'Only Draft policies can be submitted' });
        }

        policy.status = 'Pending';
        await policy.save();

        res.status(200).json({ success: true, message: 'Policy submitted for approval', policy });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Approve policy
// @route   PUT /api/policies/:id/approve
// @access  Admin
const approvePolicy = async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            return res.status(404).json({ success: false, message: 'Policy not found' });
        }

        if (policy.status !== 'Pending') {
            return res
                .status(400)
                .json({ success: false, message: 'Only Pending policies can be approved' });
        }

        policy.status = 'Approved';
        policy.approvedBy = req.user._id;
        policy.approvedAt = new Date();
        policy.remarks = req.body.remarks || '';
        await policy.save();

        await AuditLog.create({
            action: `Approved policy: "${policy.title}"`,
            performedBy: req.user._id,
            targetId: policy._id,
            targetModel: 'Policy',
        });

        res.status(200).json({ success: true, message: 'Policy approved', policy });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Reject policy
// @route   PUT /api/policies/:id/reject
// @access  Admin
const rejectPolicy = async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            return res.status(404).json({ success: false, message: 'Policy not found' });
        }

        if (policy.status !== 'Pending') {
            return res
                .status(400)
                .json({ success: false, message: 'Only Pending policies can be rejected' });
        }

        const { remarks } = req.body;
        if (!remarks) {
            return res
                .status(400)
                .json({ success: false, message: 'Rejection remarks are required' });
        }

        policy.status = 'Rejected';
        policy.remarks = remarks;
        await policy.save();

        await AuditLog.create({
            action: `Rejected policy: "${policy.title}" — Reason: ${remarks}`,
            performedBy: req.user._id,
            targetId: policy._id,
            targetModel: 'Policy',
        });

        res.status(200).json({ success: true, message: 'Policy rejected', policy });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Archive policy (soft delete)
// @route   DELETE /api/policies/:id
// @access  Admin
const archivePolicy = async (req, res) => {
    try {
        const policy = await Policy.findByIdAndUpdate(
            req.params.id,
            { isArchived: true },
            { new: true }
        );

        if (!policy) {
            return res.status(404).json({ success: false, message: 'Policy not found' });
        }

        await AuditLog.create({
            action: `Archived policy: "${policy.title}"`,
            performedBy: req.user._id,
            targetId: policy._id,
            targetModel: 'Policy',
        });

        res.status(200).json({ success: true, message: 'Policy archived' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get policy version history
// @route   GET /api/policies/:id/history
// @access  Protected
const getPolicyHistory = async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id);
        if (!policy) {
            return res.status(404).json({ success: false, message: 'Policy not found' });
        }

        // Find all versions (same parentPolicy or this policy as parent)
        const versions = await Policy.find({
            $or: [
                { parentPolicy: req.params.id },
                { parentPolicy: policy.parentPolicy || req.params.id },
                { _id: policy.parentPolicy || req.params.id },
            ],
        })
            .populate('createdBy', 'name')
            .populate('approvedBy', 'name')
            .sort({ version: 1 });

        res.status(200).json({ success: true, versions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createPolicy,
    getPolicies,
    getPolicyById,
    updatePolicy,
    submitPolicy,
    approvePolicy,
    rejectPolicy,
    archivePolicy,
    getPolicyHistory,
};
