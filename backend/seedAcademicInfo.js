require('dotenv').config();
const mongoose = require('mongoose');
const AcademicInfo = require('./models/AcademicInfo');
const connectDB = require('./config/db');

const academicData = {
    rulesAndRegulations: `1. Attendance: Minimum 75% attendance is mandatory for all courses.
2. Conduct: Students must maintain decorum and follow the code of conduct.
3. ID Cards: Must be worn visibly at all times on campus.
4. Professionalism: Students are expected to adhere to the designated dress code during formal events and labs.
5. Anti-Ragging: Our institution has a zero-tolerance policy towards ragging.`,
    
    examGuidelines: `1. Hall Tickets: Essential for entry into the examination hall.
2. Reporting Time: Arrive at least 30 minutes before the scheduled start.
3. Prohibited Items: Mobile phones, smartwatches, and programmable calculators are strictly forbidden.
4. Stationary: Students must bring their own pens, pencils, and other required items.
5. Malpractice: Any form of cheating will result in immediate disqualification and disciplinary action.`,
    
    labRules: `1. Safety First: Lab coats and closed-toe shoes are mandatory.
2. Equipment Handling: Use all apparatus with care and report any damages immediately.
3. No Food/Drink: Consumption of food or beverages is strictly prohibited in laboratories.
4. Cleanliness: Ensure the workspace is clean before leaving.
5. Instructions: Strictly follow the laboratory manual and faculty instructions.`,
    
    biometricTiming: `Morning Entry: 08:30 AM - 09:15 AM
Evening Exit: 04:30 PM - 05:30 PM
*Regular attendance is tracked via biometric logs.*`,
    
    breakTime: `Short Break: 10:45 AM - 11:00 AM
Evening Break: 03:15 PM - 03:30 PM`,
    
    lunchTime: `General Lunch Break: 12:45 PM - 01:45 PM`,
    
    internalTestDates: `Internal Assessment I: May 15th to May 20th, 2026
Internal Assessment II: June 22nd to June 27th, 2026
Model Examinations: July 10th to July 18th, 2026`,
    
    practicalExamDates: `Internal Practical: July 20th - July 25th, 2026
University Practical: August 1st - August 10th, 2026`,
    
    holidays: `1. Summer Vacation: May 25th - June 15th, 2026
2. Independence Day: August 15th, 2026
3. Ganesh Chaturthi: September 14th, 2026
4. Gandhi Jayanti: October 2nd, 2026
*Subject to changes as per government notifications.*`,
    
    internalMarksCalculation: `Internal Assessment: 40% (Average of two tests)
Assignments & Quizzes: 10%
Attendance Weightage: 10%
Total Formative Marks: 60%
End-Semester Performance: 40%`
};

const seedAcademicInfo = async () => {
    try {
        await connectDB();
        console.log('🔄 Seeding Academic Information...');

        const info = await AcademicInfo.findOneAndUpdate(
            {}, // Single document pattern
            academicData,
            { upsert: true, new: true }
        );

        console.log('✅ Academic Information seeded successfully!');
        console.log(info);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding Academic Information:', error);
        process.exit(1);
    }
};

seedAcademicInfo();
