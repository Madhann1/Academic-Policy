const mongoose = require('mongoose');

const academicInfoSchema = new mongoose.Schema(
    {
        // Academic Information
        rulesAndRegulations: { type: String, default: '' },
        examGuidelines: { type: String, default: '' },
        labRules: { type: String, default: '' },
        // Timing Information
        biometricTiming: { type: String, default: '' },
        breakTime: { type: String, default: '' },
        lunchTime: { type: String, default: '' },
        // Academic Schedule
        internalTestDates: { type: String, default: '' },
        practicalExamDates: { type: String, default: '' },
        holidays: { type: String, default: '' },
        // Marks Information
        internalMarksCalculation: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('AcademicInfo', academicInfoSchema);
