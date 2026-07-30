import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import Profile from '../models/Profile';

// Robust CommonJS / ESM require for pdf-parse
const pdfParse = require('pdf-parse');

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key_for_build' });

export const analyzeResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      res.status(400).json({ error: 'Resume text is required' });
      return;
    }

    const prompt = `
      You are an expert tech recruiter reviewing a university student's resume.
      Analyze the following resume content and return a JSON object:
      
      Resume Content: ${resumeText}
      
      Required JSON format:
      {
        "strengths": ["string"],
        "improvements": ["string"],
        "readinessScore": 85,
        "overallFeedback": "string"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume with AI' });
  }
};

export const uploadResumePdf = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Please upload a valid PDF file' });
      return;
    }

    // Extract text from uploaded PDF buffer using robust parser function
    const parseFn = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;
    const pdfData = await parseFn(req.file.buffer);
    const extractedText = pdfData.text || '';

    if (!extractedText.trim()) {
      res.status(400).json({ error: 'Could not extract readable text from PDF. Please upload a text-based PDF.' });
      return;
    }

    // Run Gemini AI analysis & extract skills automatically
    const prompt = `
      You are an expert technical recruiter analyzing a student's PDF resume.
      Extract their skills and analyze their resume readiness.
      
      PDF Resume Content:
      ${extractedText}
      
      Return ONLY a JSON object:
      {
        "extractedSkills": ["string"],
        "readinessScore": number (0-100),
        "strengths": ["string"],
        "improvements": ["string"],
        "overallFeedback": "string"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const aiResult = JSON.parse(response.text || '{}');

    // Auto-update student profile with extracted skills if available
    if (req.user?.id && aiResult.extractedSkills && aiResult.extractedSkills.length > 0) {
      let profile = await Profile.findOne({ userId: req.user.id });
      if (profile) {
        const combinedSkills = Array.from(new Set([...profile.skills, ...aiResult.extractedSkills]));
        profile.skills = combinedSkills;
        profile.resumeUrl = req.file.originalname;
        await profile.save();
      }
    }

    res.json({
      fileName: req.file.originalname,
      extractedTextSnippet: extractedText.substring(0, 300) + '...',
      extractedSkills: aiResult.extractedSkills || [],
      analysis: {
        readinessScore: aiResult.readinessScore || 85,
        strengths: aiResult.strengths || [],
        improvements: aiResult.improvements || [],
        overallFeedback: aiResult.overallFeedback || 'Resume processed successfully.'
      }
    });
  } catch (error) {
    console.error('PDF Resume upload error:', error);
    res.status(500).json({ error: 'Failed to process PDF resume with AI' });
  }
};
