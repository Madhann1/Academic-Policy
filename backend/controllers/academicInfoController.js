const AcademicInfo = require('../models/AcademicInfo');
const AuditLog = require('../models/AuditLog');

// @desc    Get academic info (singleton)
// @route   GET /api/academic-info
// @access  Protected (all roles)
const getAcademicInfo = async (req, res) => {
    try {
        // findOne on singleton — create default doc if none exists
        let info = await AcademicInfo.findOne();
        if (!info) {
            info = await AcademicInfo.create({});
        }
        res.status(200).json({ success: true, academicInfo: info });
    } catch (error) {
        console.error('Get academic info error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update academic info
// @route   PUT /api/academic-info
// @access  Admin only
const updateAcademicInfo = async (req, res) => {
    try {
        const {
            rulesAndRegulations,
            examGuidelines,
            labRules,
            biometricTiming,
            breakTime,
            lunchTime,
            internalTestDates,
            practicalExamDates,
            holidays,
            internalMarksCalculation,
        } = req.body;

        // Upsert the singleton document
        const info = await AcademicInfo.findOneAndUpdate(
            {},
            {
                rulesAndRegulations,
                examGuidelines,
                labRules,
                biometricTiming,
                breakTime,
                lunchTime,
                internalTestDates,
                practicalExamDates,
                holidays,
                internalMarksCalculation,
            },
            { new: true, upsert: true, runValidators: true }
        );

        await AuditLog.create({
            action: 'Updated academic information settings',
            performedBy: req.user._id,
            targetModel: 'AcademicInfo',
        });

        res.status(200).json({ success: true, message: 'Academic info updated', academicInfo: info });
    } catch (error) {
        console.error('Update academic info error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getAcademicInfo, updateAcademicInfo };
