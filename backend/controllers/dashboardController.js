const User = require('../models/User');
const Policy = require('../models/Policy');
const Request = require('../models/Request');

// @desc    Admin dashboard analytics
// @route   GET /api/dashboard/admin
// @access  Admin
const getAdminDashboard = async (req, res) => {
    try {
        const [
            totalUsers,
            totalFaculty,
            totalStudents,
            totalPolicies,
            pendingPolicies,
            approvedPolicies,
            rejectedPolicies,
            draftPolicies,
            pendingRequests,
            totalRequests,
        ] = await Promise.all([
            User.countDocuments({ isActive: true }),
            User.countDocuments({ role: 'faculty', isActive: true }),
            User.countDocuments({ role: 'student', isActive: true }),
            Policy.countDocuments({ isArchived: false }),
            Policy.countDocuments({ status: 'Pending', isArchived: false }),
            Policy.countDocuments({ status: 'Approved', isArchived: false }),
            Policy.countDocuments({ status: 'Rejected', isArchived: false }),
            Policy.countDocuments({ status: 'Draft', isArchived: false }),
            Request.countDocuments({ status: 'Pending' }),
            Request.countDocuments(),
        ]);

        // Recent policies
        const recentPolicies = await Policy.find({ isArchived: false })
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        // Recent requests
        const recentRequests = await Request.find()
            .populate('facultyId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            analytics: {
                users: { total: totalUsers, faculty: totalFaculty, students: totalStudents },
                policies: {
                    total: totalPolicies,
                    pending: pendingPolicies,
                    approved: approvedPolicies,
                    rejected: rejectedPolicies,
                    draft: draftPolicies,
                },
                requests: { total: totalRequests, pending: pendingRequests },
            },
            recentPolicies,
            recentRequests,
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Faculty dashboard data
// @route   GET /api/dashboard/faculty
// @access  Faculty
const getFacultyDashboard = async (req, res) => {
    try {
        const [draft, pending, approved, rejected, myRequests] = await Promise.all([
            Policy.countDocuments({ createdBy: req.user._id, status: 'Draft', isArchived: false }),
            Policy.countDocuments({ createdBy: req.user._id, status: 'Pending', isArchived: false }),
            Policy.countDocuments({ createdBy: req.user._id, status: 'Approved', isArchived: false }),
            Policy.countDocuments({ createdBy: req.user._id, status: 'Rejected', isArchived: false }),
            Request.countDocuments({ facultyId: req.user._id }),
        ]);

        const recentPolicies = await Policy.find({ createdBy: req.user._id, isArchived: false })
            .sort({ updatedAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            analytics: { draft, pending, approved, rejected, myRequests },
            recentPolicies,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getAdminDashboard, getFacultyDashboard };
