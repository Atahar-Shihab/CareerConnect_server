import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { connectDB } from './db';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import jobRoutes from './routes/job';
import { analyzeResume, uploadResumePdf } from './controllers/resume';
import { createCheckoutSession } from './controllers/payment';
import { authenticate } from './middleware/auth';
import User from './models/User';
import Profile from './models/Profile';
import JobPosting from './models/JobPosting';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.post('/api/resume/analyze', authenticate, analyzeResume);
app.post('/api/resume/upload', authenticate, upload.single('resume'), uploadResumePdf);
app.post('/api/payments/create-checkout-session', authenticate, createCheckoutSession);

app.get('/', (req, res) => {
  res.json({ message: 'CareerConnect API is up and running' });
});

// Auto seed helper if empty
const seedIfEmpty = async () => {
  const count = await JobPosting.countDocuments();
  if (count === 0) {
    console.log('Seeding initial 8 realistic campus postings...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const employer = await User.create({
      name: 'TechCorp Bangladesh',
      email: 'hr@techcorp.bd',
      passwordHash,
      role: 'employer',
    });

    const student = await User.create({
      name: 'Shihab',
      email: 'shihab@brac.bd.com',
      passwordHash,
      role: 'student'
    });

    const studentProfile = new Profile({
      userId: student._id,
      bio: 'BRAC University CS Student interested in AI Engineering & Full Stack Web Development.',
      skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS', 'Python']
    });
    await studentProfile.save();

    await JobPosting.insertMany([
      {
        employerId: employer._id,
        title: 'Junior React & Next.js Developer',
        companyName: 'TechCorp Bangladesh',
        location: 'Dhaka (Gulshan-2)',
        description: 'We are seeking a proactive Junior Frontend Engineer from university campus drives. You will work on cutting-edge Web3 and AI web applications using Next.js 14, Tailwind CSS, and TypeScript.',
        requirements: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
        type: 'full-time'
      },
      {
        employerId: employer._id,
        title: 'AI Product Engineering Intern',
        companyName: 'Brain Station 23',
        location: 'Remote / Dhaka',
        description: 'Hands-on internship for CS students interested in LLM integration, prompt engineering, and Node.js microservices. Flexible hours around your university class schedule.',
        requirements: ['Node.js', 'Express', 'Python', 'LLM API', 'MongoDB'],
        type: 'internship'
      },
      {
        employerId: employer._id,
        title: 'Full Stack MERN Developer',
        companyName: 'Pathao Tech',
        location: 'Dhaka (Midtown)',
        description: 'Join Pathao Tech to scale logistics and food delivery platforms. Looking for final year students or fresh grads with strong problem-solving skills.',
        requirements: ['React', 'Node.js', 'Express', 'MongoDB', 'Docker'],
        type: 'full-time'
      },
      {
        employerId: employer._id,
        title: 'UI/UX & Product Design Fellow',
        companyName: 'ShopUp',
        location: 'Dhaka (Banani)',
        description: 'Design beautiful, intuitive interfaces for Bangladeshi merchants. Create design systems, user flows, and interactive Figma prototypes.',
        requirements: ['Figma', 'UI/UX Design', 'Wireframing', 'User Research'],
        type: 'part-time'
      },
      {
        employerId: employer._id,
        title: 'Python & Data Science Research Fellow',
        companyName: 'bKash Tech',
        location: 'Dhaka (Nikunja)',
        description: 'Analyze financial transaction data and build predictive machine learning models using Python, Pandas, and Scikit-Learn.',
        requirements: ['Python', 'Pandas', 'Machine Learning', 'SQL', 'Data Analytics'],
        type: 'internship'
      },
      {
        employerId: employer._id,
        title: 'Flutter Mobile App Developer',
        companyName: 'Chaldal Tech',
        location: 'Remote / Dhaka',
        description: 'Build cross-platform iOS & Android grocery delivery applications using Flutter, Dart, and Firebase.',
        requirements: ['Flutter', 'Dart', 'Firebase', 'State Management'],
        type: 'full-time'
      },
      {
        employerId: employer._id,
        title: 'Cyber Security & DevOps Analyst',
        companyName: 'Therap BD',
        location: 'Dhaka (Mohakhali)',
        description: 'Monitor cloud infrastructure, configure Docker containers, and implement vulnerability assessments for healthcare software.',
        requirements: ['DevOps', 'Docker', 'Linux', 'Cyber Security', 'AWS'],
        type: 'full-time'
      },
      {
        employerId: employer._id,
        title: 'QA & Automated Testing Fellow',
        companyName: 'Kaz Software',
        location: 'Dhaka (Uttara)',
        description: 'Write automated end-to-end regression tests using Cypress, Playwright, and Selenium for enterprise Web applications.',
        requirements: ['Selenium', 'Cypress', 'JavaScript', 'QA Testing'],
        type: 'part-time'
      }
    ]);
    console.log('Database auto-seeded with 8 realistic university campus postings!');
  }
};

// Start Server
const startServer = async () => {
  await connectDB();
  await seedIfEmpty();
  app.listen(PORT, () => {
    console.log(`CareerConnect Server running on http://localhost:${PORT}`);
  });
};

startServer();
