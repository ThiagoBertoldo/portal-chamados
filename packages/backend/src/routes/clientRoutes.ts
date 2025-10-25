import { Router } from 'express';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/', getClients);
router.get('/:id', getClient);
router.post('/', authorize('ADMIN', 'ATTENDANT'), createClient);
router.put('/:id', authorize('ADMIN', 'ATTENDANT'), updateClient);
router.delete('/:id', authorize('ADMIN'), deleteClient);

export default router;
