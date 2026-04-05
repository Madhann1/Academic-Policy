const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};

        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const users = await User.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;

        if (!name || !email || !password || !role) {
            return res
                .status(400)
                .json({ success: false, message: 'Please provide name, email, password and role' });
        }

        if (role === 'admin') {
            return res
                .status(400)
                .json({ success: false, message: 'Cannot create admin users via this endpoint' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ success: false, message: 'User with this email already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            department,
            firstLogin: true,
        });

        // Audit log
        await AuditLog.create({
            action: `Created new ${role} user: ${name}`,
            performedBy: req.user._id,
            targetId: user._id,
            targetModel: 'User',
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                firstLogin: user.firstLogin,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res) => {
    try {
        const { name, department, isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, department, isActive },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await AuditLog.create({
            action: `Updated user: ${user.name}`,
            performedBy: req.user._id,
            targetId: user._id,
            targetModel: 'User',
        });

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Deactivate (soft delete) user
// @route   DELETE /api/users/:id
// @access  Admin
const deactivateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await AuditLog.create({
            action: `Deactivated user: ${user.name}`,
            performedBy: req.user._id,
            targetId: user._id,
            targetModel: 'User',
        });

        res.status(200).json({ success: true, message: 'User deactivated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getAllUsers, createUser, getUserById, updateUser, deactivateUser };
