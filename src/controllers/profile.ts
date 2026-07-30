import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Profile from '../models/Profile';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await Profile.findOne({ userId: req.user?.id }).populate('userId', 'name email');
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bio, skills, education, experience, portfolioUrl, resumeUrl } = req.body;

    let profile = await Profile.findOne({ userId: req.user?.id });
    if (!profile) {
      profile = new Profile({
        userId: req.user?.id,
        bio, skills, education, experience, portfolioUrl, resumeUrl
      });
    } else {
      if (bio !== undefined) profile.bio = bio;
      if (skills !== undefined) profile.skills = skills;
      if (education !== undefined) profile.education = education;
      if (experience !== undefined) profile.experience = experience;
      if (portfolioUrl !== undefined) profile.portfolioUrl = portfolioUrl;
      if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl;
    }

    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
