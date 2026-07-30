import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import JobPosting from '../models/JobPosting';
import Application from '../models/Application';
import Profile from '../models/Profile';
import Interaction from '../models/Interaction';
import { evaluateMatch, generateCoverLetter, analyzeCoverLetterFit } from '../services/ai';

export const getJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const sort = (req.query.sort as string) || 'newest';
    const location = req.query.location as string;
    const type = req.query.type as string;
    const skill = req.query.skill as string;

    const filter: any = {};
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (type) filter.type = type;
    if (skill) filter.requirements = { $regex: skill, $options: 'i' };

    const sortOption: any = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const jobs = await JobPosting.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('employerId', 'name');

    const total = await JobPosting.countDocuments(filter);

    res.json({ jobs, total, page, limit, hasMore: total > page * limit });
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
    if (req.user && req.user.id) {
      try {
        await Interaction.create({ userId: req.user.id, jobId: job._id, type: 'viewed' });
        const profile = await Profile.findOne({ userId: req.user.id });
        if (profile && profile.skills && profile.skills.length > 0) {
          matchInfo = await evaluateMatch(profile, job);
        }
      } catch (aiErr) {
        console.warn('Gemini match evaluation fallback:', aiErr);
        matchInfo = { matchAvailable: false };
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
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
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
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
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

    if (job.employerId.toString() === userId) {
      res.status(400).json({ error: 'Cannot apply to your own job' });
      return;
    }

    const profile = await Profile.findOne({ userId });
    
    let aiCoverLetter = '';
    const { tone, length } = req.body;
    try {
      aiCoverLetter = await generateCoverLetter(profile, job, tone, length);
    } catch (e) {
      aiCoverLetter = `Dear Hiring Team at ${job.companyName},\n\nI am writing to express my strong enthusiasm for the ${job.title} position. As a proactive CS student with hands-on technical skills, I am excited about the opportunity to contribute to your engineering team.\n\nSincerely,\nCandidate`;
    }

    await Interaction.create({ userId, jobId: jobId as string, type: 'applied' });

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

export const getMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile || !profile.skills || profile.skills.length === 0) {
      res.status(400).json({ error: 'Profile with skills required for matching' });
      return;
    }

    const jobs = await JobPosting.find().populate('employerId', 'name');
    const userSkillsLower = profile.skills.map(s => s.toLowerCase());

    const matches = jobs.map(job => {
      let score = 0;
      if (job.requirements && job.requirements.length > 0) {
        const requiredLower = job.requirements.map((r: string) => r.toLowerCase());
        const matchCount = requiredLower.filter((r: string) => userSkillsLower.includes(r)).length;
        score = (matchCount / requiredLower.length) * 100;
      }
      return { job, score };
    });

    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, 10);

    res.json(topMatches);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const draftCoverLetter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { jobId } = req.params;
    const { tone = 'Formal', length = 'Medium' } = req.body;

    const job = await JobPosting.findById(jobId);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const profile = await Profile.findOne({ userId: req.user.id });
    
    let analysis = { matchedSkills: [], gapSkills: [], suggestedAngle: '' };
    try {
      analysis = await analyzeCoverLetterFit(profile, job);
    } catch (e) {
      console.warn('Cover letter analysis failed:', e);
    }

    let coverLetter = '';
    try {
      coverLetter = await generateCoverLetter(profile, job, tone, length);
    } catch (e) {
      coverLetter = `Dear Hiring Team at ${job.companyName},\n\nI am writing to express my strong enthusiasm for the ${job.title} position...`;
    }

    res.json({ coverLetter, analysis });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const job = await JobPosting.findById(id);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (job.employerId.toString() !== req.user.id) {
      res.status(403).json({ error: 'You can only delete your own job postings' });
      return;
    }

    await Application.deleteMany({ jobId: id });
    await Interaction.deleteMany({ jobId: id });
    await JobPosting.findByIdAndDelete(id);

    res.json({ message: 'Job posting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
