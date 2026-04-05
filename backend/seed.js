require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Policy = require('./models/Policy');
const connectDB = require('./config/db');

const seed = async () => {
    await connectDB();

    console.log('🌱 Starting database seed...\n');

    // Clear existing data (optional — comment out to preserve)
    await User.deleteMany({});
    await Policy.deleteMany({});
    console.log('✅ Cleared existing users and policies\n');

    // Create Admin
    const admin = await User.create({
        name: 'System Administrator',
        email: 'admin@apm.edu',
        password: 'Admin@123',
        role: 'admin',
        firstLogin: false,
    });
    console.log(`✅ Admin created: ${admin.email} / Admin@123`);

    // Create HOD
    const hod = await User.create({
        name: 'Dr. Anitha Ramesh',
        email: 'hod@apm.edu',
        password: 'Hod@1234',
        role: 'hod',
        department: 'Computer Science',
        firstLogin: false,
    });
    console.log(`✅ HOD created: ${hod.email} / Hod@1234`);

    // Create Faculty members
    const faculty1 = await User.create({
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@apm.edu',
        password: 'Faculty@123',
        role: 'faculty',
        department: 'Computer Science',
        firstLogin: true,
    });
    console.log(`✅ Faculty created: ${faculty1.email} / Faculty@123`);

    const faculty2 = await User.create({
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@apm.edu',
        password: 'Faculty@123',
        role: 'faculty',
        department: 'Information Technology',
        firstLogin: false,
    });
    console.log(`✅ Faculty created: ${faculty2.email} / Faculty@123`);

    // Create Students
    const student1 = await User.create({
        name: 'Arjun Singh',
        email: 'arjun.singh@student.apm.edu',
        password: 'Student@123',
        role: 'student',
        firstLogin: false,
    });
    console.log(`✅ Student created: ${student1.email} / Student@123`);

    const student2 = await User.create({
        name: 'Meera Patel',
        email: 'meera.patel@student.apm.edu',
        password: 'Student@123',
        role: 'student',
        firstLogin: false,
    });
    console.log(`✅ Student created: ${student2.email} / Student@123`);

    // Create sample policies
    const policy1 = await Policy.create({
        title: 'Academic Integrity Policy',
        description:
            'This policy outlines the standards for academic integrity expected of all students and faculty members. It covers plagiarism, cheating, and proper citation practices.',
        category: 'Academic',
        createdBy: faculty2._id,
        status: 'Approved',
        version: 1,
        approvedBy: admin._id,
        approvedAt: new Date(),
    });

    const policy2 = await Policy.create({
        title: 'Examination Conduct Guidelines',
        description:
            'Detailed guidelines for conduct during examinations including permitted materials, prohibited activities, and consequences for violations.',
        category: 'Examination',
        createdBy: faculty2._id,
        status: 'Approved',
        version: 1,
        approvedBy: admin._id,
        approvedAt: new Date(),
    });

    const policy3 = await Policy.create({
        title: 'Curriculum Review Process',
        description:
            'Standard operating procedure for reviewing and updating the curriculum. Includes timelines, stakeholder involvement, and approval workflows.',
        category: 'Curriculum',
        createdBy: faculty2._id,
        status: 'Pending',
        version: 1,
    });

    const policy4 = await Policy.create({
        title: 'Student Discipline Framework',
        description:
            'Framework for addressing student disciplinary issues including minor infractions, major violations, and appeals process.',
        category: 'Discipline',
        createdBy: faculty1._id,
        status: 'Draft',
        version: 1,
    });

    console.log('\n✅ Sample policies created');

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Database seeded successfully!');
    console.log('='.repeat(50));
    console.log('\n📋 Login Credentials:');
    console.log('  Admin:   admin@apm.edu       / Admin@123');
    console.log('  HOD:     hod@apm.edu          / Hod@1234');
    console.log('  Faculty: rajesh.kumar@apm.edu / Faculty@123 (first login)');
    console.log('  Faculty: priya.sharma@apm.edu / Faculty@123');
    console.log('  Student: arjun.singh@student.apm.edu / Student@123');
    console.log('  Student: meera.patel@student.apm.edu / Student@123');
    console.log('='.repeat(50) + '\n');

    process.exit(0);
};

seed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
});
