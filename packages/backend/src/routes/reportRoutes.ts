import { Router } from 'express';
import {
  clientSynthetic,
  clientAnalytical,
  dailyTickets,
  monthlyTickets,
  byCategory,
  slaCompliance,
} from '../controllers/reportController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/client-synthetic', clientSynthetic);
router.get('/client-analytical', clientAnalytical);
router.get('/daily-tickets', dailyTickets);
router.get('/monthly-tickets', monthlyTickets);
router.get('/by-category', byCategory);
router.get('/sla-compliance', slaCompliance);

export default router;
