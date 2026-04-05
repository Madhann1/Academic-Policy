const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Policy title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        category: {
            type: String,
            enum: ['Academic', 'Examination', 'Curriculum', 'Discipline'],
            required: [true, 'Category is required'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['Draft', 'Pending', 'Approved', 'Rejected'],
            default: 'Draft',
        },
        version: {
            type: Number,
            default: 1,
        },
        fileUrl: {
            type: String,
            default: null,
        },
        remarks: {
            type: String,
            default: '',
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        approvedAt: {
            type: Date,
            default: null,
        },
        parentPolicy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Policy',
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Policy', policySchema);
