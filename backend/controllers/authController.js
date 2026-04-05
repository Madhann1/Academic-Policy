const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res
                .status(401)
                .json({ success: false, message: 'Account has been deactivated. Contact admin.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                firstLogin: user.firstLogin,
                department: user.department,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Change password (first login or voluntary)
// @route   PUT /api/auth/change-password
// @access  Protected
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res
                .status(400)
                .json({ success: false, message: 'Please provide current and new password' });
        }

        if (newPassword.length < 6) {
            return res
                .status(400)
                .json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res
                .status(400)
                .json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        user.firstLogin = false;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            firstLogin: false,
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Protected
const getMe = async (req, res) => {
    res.status(200).json({ success: true, user: req.user });
};

module.exports = { login, changePassword, getMe };
