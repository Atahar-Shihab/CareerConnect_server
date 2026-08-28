import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import Profile from '../models/Profile';
import { AuthRequest } from '../middleware/auth';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      passwordHash,
      role: role || 'student',
    });

    await user.save();

    if (user.role === 'student') {
      const profile = new Profile({ userId: user._id });
      await profile.save();
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    if (user.authProvider === 'google') {
      res.status(400).json({ error: 'This account uses Google Sign-In. Please use the Google login button.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

    res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      res.status(400).json({ error: 'Google credential is required.' });
      return;
    }

    let userEmail = '';
    let userName = '';

    // Strategy 1: Try verifying as an ID token (from GoogleLogin component)
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const googlePayload = ticket.getPayload();
      if (googlePayload?.email) {
        userEmail = googlePayload.email;
        userName = googlePayload.name || googlePayload.email.split('@')[0];
      }
    } catch {
      // Strategy 2: Treat as an access token (from useGoogleLogin hook)
      // and fetch user info from Google's userinfo endpoint
      try {
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${credential}` },
        });
        if (!googleRes.ok) {
          res.status(401).json({ error: 'Google authentication failed. Invalid token.' });
          return;
        }
        const googleUser = await googleRes.json();
        if (googleUser.email) {
          userEmail = googleUser.email;
          userName = googleUser.name || googleUser.email.split('@')[0];
        }
      } catch (fetchError) {
        console.error('Google userinfo fetch error:', fetchError);
        res.status(401).json({ error: 'Google authentication failed. Could not verify token.' });
        return;
      }
    }

    if (!userEmail) {
      res.status(400).json({ error: 'Google authentication failed. Email not found.' });
      return;
    }

    let user = await User.findOne({ email: userEmail });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const randomPassword = require('crypto').randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, salt);
      user = new User({
        name: userName,
        email: userEmail,
        passwordHash,
        role: role || 'student',
        authProvider: 'google'
      });
      await user.save();

      if (user.role === 'student') {
        const profile = new Profile({
          userId: user._id,
          bio: 'Authenticated via Google OAuth.',
          skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'Tailwind CSS']
        });
        await profile.save();
      }
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
};
