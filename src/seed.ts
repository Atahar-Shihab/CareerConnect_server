import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User';
import JobPosting from './models/JobPosting';
import Profile from './models/Profile';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/careerconnect');
    console.log('Connected to DB for seeding...');

    // Clear existing
    await User.deleteMany({});
    await JobPosting.deleteMany({});
    await Profile.deleteMany({});

    // Create an employer
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const employer = await User.create({
      name: 'TechCorp Bangladesh',
      email: 'hr@techcorp.bd',
      passwordHash,
      role: 'employer',
    });

    // Create jobs
    await JobPosting.insertMany([
      {
        employerId: employer._id,
        title: 'Junior React Developer',
        companyName: 'TechCorp Bangladesh',
        location: 'Dhaka',
        description: 'We are looking for a passionate Junior React Developer to join our growing team. You will be responsible for building modern UI components.',
        requirements: ['React', 'TypeScript', 'Tailwind CSS'],
        type: 'full-time'
      },
      {
        employerId: employer._id,
        title: 'Backend Engineering Intern',
        companyName: 'TechCorp Bangladesh',
        location: 'Remote',
        description: 'Great opportunity for students to learn backend engineering with Node.js and Express.',
        requirements: ['Node.js', 'Express', 'MongoDB'],
        type: 'internship'
      },
      {
        employerId: employer._id,
        title: 'Full Stack Engineer',
        companyName: 'Innovate BD',
        location: 'Chattogram',
        description: 'Join our fast-paced startup to build end-to-end features using the MERN stack.',
        requirements: ['React', 'Node.js', 'MongoDB', 'Next.js'],
        type: 'full-time'
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
