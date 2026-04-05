const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
    {
        formType: {
            type: String,
            enum: [
                'Transport Requisition',
                'Annexure 2A - Subject Expert Recommendation',
                'Guest Accommodation',
            ],
            required: [true, 'Form type is required'],
        },
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        details: {
            // Transport Requisition fields
            destination: String,
            travelDate: Date,
            returnDate: Date,
            purpose: String,
            numberOfPersons: Number,
            vehicleType: String,

            // Annexure 2A fields
            subjectName: String,
            expertName: String,
            expertDesignation: String,
            expertInstitution: String,
            proposedDate: Date,
            topicsCovered: String,

            // Guest Accommodation fields
            guestName: String,
            guestDesignation: String,
            guestInstitution: String,
            checkInDate: Date,
            checkOutDate: Date,
            roomType: String,
            specialRequirements: String,
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
        remarks: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
