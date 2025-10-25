import { Router } from 'express';
import {
  getSLAs,
  getSLA,
  createSLA,
  updateSLA,
  deleteSLA,
} from '../controllers/slaController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getSLAs);
router.get('/:id', getSLA);
router.post('/', authorize('ADMIN'), createSLA);
router.put('/:id', authorize('ADMIN'), updateSLA);
router.delete('/:id', authorize('ADMIN'), deleteSLA);

export default router;
