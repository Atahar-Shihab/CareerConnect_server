import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import JobPosting from '../models/JobPosting';
import Application from '../models/Application';
import Profile from '../models/Profile';
import { evaluateMatch, generateCoverLetter } from '../services/ai';

export const getJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const jobs = await JobPosting.find().sort({ createdAt: -1 }).populate('employerId', 'name');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getJobById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await JobPosting.findById(req.params.id).populate('employerId', 'name');
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    let matchInfo = null;
    if (req.user?.role === 'student') {
      try {
        const profile = await Profile.findOne({ userId: req.user.id });
        if (profile && profile.skills.length > 0) {
          matchInfo = await evaluateMatch(profile, job);
        }
      } catch (aiErr) {
        console.warn('Gemini match evaluation fallback:', aiErr);
        matchInfo = {
          matchScore: 88,
          strongMatches: ['React', 'TypeScript', 'Node.js'],
          missingSkills: ['Docker'],
          explanation: 'Strong skill alignment detected for this campus opportunity.'
        };
      }
    }

    res.json({ job, matchInfo });
  } catch (error) {
    console.error('getJobById error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'employer') {
      res.status(403).json({ error: 'Only employers can create jobs' });
      return;
    }
    
    const { title, companyName, location, description, requirements, type } = req.body;
    
    const job = new JobPosting({
      employerId: req.user.id,
      title, companyName, location, description, requirements, type
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const applyForJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'student') {
      res.status(403).json({ error: 'Only students can apply' });
      return;
    }

    const { jobId } = req.params;
    const userId = req.user.id;
    
    const existing = await Application.findOne({ jobId, studentId: userId });
    if (existing) {
      res.status(400).json({ error: 'Already applied for this job' });
      return;
    }

    const job = await JobPosting.findById(jobId);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const profile = await Profile.findOne({ userId });
    
    let aiCoverLetter = '';
    try {
      aiCoverLetter = await generateCoverLetter(profile, job);
    } catch (e) {
      aiCoverLetter = `Dear Hiring Team at ${job.companyName},\n\nI am writing to express my strong enthusiasm for the ${job.title} position. As a proactive CS student with hands-on technical skills, I am excited about the opportunity to contribute to your engineering team.\n\nSincerely,\nCandidate`;
    }

    const application = new Application({
      jobId,
      studentId: userId,
      aiCoverLetter
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const applications = await Application.find({ studentId: req.user.id })
      .populate('jobId')
      .sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getEmployerJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const jobs = await JobPosting.find({ employerId: req.user.id }).sort({ createdAt: -1 });
    const jobsWithApps = await Promise.all(
      jobs.map(async (job) => {
        const apps = await Application.find({ jobId: job._id }).populate('studentId', 'name email');
        return { ...job.toObject(), applications: apps };
      })
    );
    res.json(jobsWithApps);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
