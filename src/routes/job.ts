import express from 'express';
import { getJobs, getJobById, createJob, applyForJob, getMyApplications, getEmployerJobs } from '../controllers/job';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getJobs);
router.post('/', authenticate, createJob);
router.get('/my-applications', authenticate, getMyApplications);
router.get('/employer/my-jobs', authenticate, getEmployerJobs);
router.get('/:id', authenticate, getJobById);
router.post('/:jobId/apply', authenticate, applyForJob);

export default router;
