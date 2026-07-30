import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key_for_build' });

/**
 * Smart Match Engine
 * Compares student skills against job requirements and returns a match score and explanation.
 */
export const evaluateMatch = async (studentProfile: any, jobPosting: any) => {
  const prompt = `
    You are an expert technical recruiter and career advisor.
    Evaluate the match between the following student profile and job posting.
    
    Student Profile: ${JSON.stringify(studentProfile)}
    Job Posting: ${JSON.stringify(jobPosting)}
    
    Return ONLY a JSON object with this structure:
    {
      "matchScore": number (0-100),
      "strongMatches": string[],
      "missingSkills": string[],
      "explanation": string
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Error in evaluateMatch:', error);
    throw new Error('Failed to evaluate match using Gemini API');
  }
};

/**
 * AI Cover Letter Assistant
 * Drafts a contextualized cover letter for a specific job application.
 */
export const generateCoverLetter = async (studentProfile: any, jobPosting: any, tone: string = 'Formal', length: string = 'Medium'): Promise<string> => {
  const prompt = `
    You are an expert career coach helping a student write a compelling cover letter.
    Using the student's profile and the job posting details below, draft a professional, engaging cover letter.
    Highlight relevant skills and experiences. The tone should be ${tone} and the length should be ${length}.
    
    Student Profile: ${JSON.stringify(studentProfile)}
    Job Posting: ${JSON.stringify(jobPosting)}
    
    Return ONLY the plain text of the cover letter.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || 'Cover letter generated successfully.';
  } catch (error) {
    console.error('Error in generateCoverLetter:', error);
    throw new Error('Failed to generate cover letter using Gemini API');
  }
};

export const analyzeCoverLetterFit = async (studentProfile: any, jobPosting: any) => {
  const prompt = `
    You are an expert career coach. Analyze the fit between the student profile and job posting.
    
    Student Profile: ${JSON.stringify(studentProfile)}
    Job Posting: ${JSON.stringify(jobPosting)}
    
    Return ONLY a JSON object with this structure:
    {
      "matchedSkills": string[],
      "gapSkills": string[],
      "suggestedAngle": string
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Error in analyzeCoverLetterFit:', error);
    throw new Error('Failed to analyze fit using Gemini API');
  }
};
