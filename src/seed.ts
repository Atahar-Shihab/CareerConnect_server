import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import JobPosting from './models/JobPosting';
import Profile from './models/Profile';
import Application from './models/Application';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/careerconnect');
    console.log('Connected to DB for seeding...');

    // Clear ALL existing data
    await Application.deleteMany({});
    await JobPosting.deleteMany({});
    await Profile.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared all existing data.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Create demo employer
    const employer = await User.create({
      name: 'CodeCraft BD',
      email: 'hr@codecraft.bd',
      passwordHash,
      role: 'employer',
    });

    // Create demo student
    const student = await User.create({
      name: 'Rahat Ahmed',
      email: 'rahat@demo.cc',
      passwordHash,
      role: 'student'
    });

    // Create student profile
    await Profile.create({
      userId: student._id,
      bio: 'CS student passionate about full-stack development and AI.',
      skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS', 'MongoDB'],
      education: 'BSc in Computer Science, Shomoy University',
      experience: 'Frontend Intern at CodeCraft BD (6 months)'
    });

    // Seed 8 campus job postings
    await JobPosting.insertMany([
      {
        employerId: employer._id,
        title: 'Junior React & Next.js Developer',
        companyName: 'CodeCraft BD',
        location: 'Dhaka (Gulshan-2)',
        description: 'We are seeking a proactive Junior Frontend Engineer from university campus drives. You will work on cutting-edge Web3 and AI web applications using Next.js 14, Tailwind CSS, and TypeScript.',
        requirements: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
        type: 'full-time'
      },
      {
        employerId: employer._id,
        title: 'AI Product Engineering Intern',
        companyName: 'NovaByte Solutions',
        location: 'Remote / Dhaka',
        description: 'Hands-on internship for CS students interested in LLM integration, prompt engineering, and Node.js microservices. Flexible hours around your university class schedule.',
        requirements: ['Node.js', 'Express', 'Python', 'LLM API', 'MongoDB'],
        type: 'internship'
      },
      {
        employerId: employer._id,
        title: 'Full Stack MERN Developer',
        companyName: 'SwiftRide Tech',
        location: 'Dhaka (Midtown)',
        description: 'Join SwiftRide Tech to scale logistics and food delivery platforms. Looking for final year students or fresh grads with strong problem-solving skills.',
        requirements: ['React', 'Node.js', 'Express', 'MongoDB', 'Docker'],
        type: 'full-time'
      },
      {
        employerId: employer._id,
        title: 'UI/UX & Product Design Fellow',
        companyName: 'BazaarStack',
        location: 'Dhaka (Banani)',
        description: 'Design beautiful, intuitive interfaces for Bangladeshi merchants. Create design systems, user flows, and interactive Figma prototypes.',
        requirements: ['Figma', 'UI/UX Design', 'Wireframing', 'User Research'],
        type: 'internship'
      },
      {
        employerId: employer._id,
        title: 'Python & Data Science Research Fellow',
        companyName: 'PayWave Digital',
        location: 'Dhaka (Nikunja)',
        description: 'Analyze financial transaction data and build predictive machine learning models using Python, Pandas, and Scikit-Learn.',
        requirements: ['Python', 'Pandas', 'Machine Learning', 'SQL', 'Data Analytics'],
        type: 'part-time'
      },
      {
        employerId: employer._id,
        title: 'Flutter Mobile App Developer',
        companyName: 'FreshCart Tech',
        location: 'Remote / Dhaka',
        description: 'Build cross-platform iOS & Android grocery delivery applications using Flutter, Dart, and Firebase.',
        requirements: ['Flutter', 'Dart', 'Firebase', 'State Management'],
        type: 'full-time'
      },
      {
        employerId: employer._id,
        title: 'Cyber Security & DevOps Analyst',
        companyName: 'MedLink Systems',
        location: 'Dhaka (Mohakhali)',
        description: 'Monitor cloud infrastructure, configure Docker containers, and implement vulnerability assessments for healthcare software.',
        requirements: ['DevOps', 'Docker', 'Linux', 'Cyber Security', 'AWS'],
        type: 'full-time'
      },
      {
        employerId: employer._id,
        title: 'QA & Automated Testing Fellow',
        companyName: 'PixelForge Labs',
        location: 'Dhaka (Uttara)',
        description: 'Write automated end-to-end regression tests using Cypress, Playwright, and Selenium for enterprise Web applications.',
        requirements: ['Selenium', 'Cypress', 'JavaScript', 'QA Testing'],
        type: 'internship'
      }
    ]);

    console.log('✅ Database seeded successfully with new fictional data!');
    console.log('   Demo Student: rahat@demo.cc / password123');
    console.log('   Demo Employer: hr@codecraft.bd / password123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
