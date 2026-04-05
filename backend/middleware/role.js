/**
 * Role-Based Access Control middleware
 * Usage: authorizeRoles('admin', 'faculty')
 */
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Role '${req.user.role}' is not authorized.`,
            });
        }
        next();
    };
};

module.exports = { authorizeRoles };
