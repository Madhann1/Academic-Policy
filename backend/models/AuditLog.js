const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        trim: true,
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    targetModel: {
        type: String,
        enum: ['Policy', 'User', 'Request'],
        default: null,
    },
    details: {
        type: String,
        default: '',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
