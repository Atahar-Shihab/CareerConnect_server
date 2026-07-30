import express from 'express';
import { getJobs, getJobById, createJob, applyForJob, getMyApplications, getEmployerJobs, getMatches, draftCoverLetter, deleteJob } from '../controllers/job';
import { authenticate } from '../middleware/auth';
import { RequestHandler } from 'express';

const router = express.Router();

router.get('/', getJobs as unknown as RequestHandler);
router.post('/', authenticate, createJob as unknown as RequestHandler);
router.get('/my-applications', authenticate, getMyApplications as unknown as RequestHandler);
router.get('/employer/my-jobs', authenticate, getEmployerJobs as unknown as RequestHandler);
router.get('/matches', authenticate, getMatches as unknown as RequestHandler);
router.get('/:id', getJobById as unknown as RequestHandler);
router.post('/:jobId/apply', authenticate, applyForJob as unknown as RequestHandler);
router.post('/:jobId/draft-cover-letter', authenticate, draftCoverLetter as unknown as RequestHandler);
router.delete('/:id', authenticate, deleteJob as unknown as RequestHandler);

export default router;
