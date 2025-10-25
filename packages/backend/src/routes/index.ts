import { Router } from 'express';
import authRoutes from './authRoutes';
import clientRoutes from './clientRoutes';
import categoryRoutes from './categoryRoutes';
import slaRoutes from './slaRoutes';
import userRoutes from './userRoutes';
import ticketRoutes from './ticketRoutes';
import reportRoutes from './reportRoutes';
import publicRoutes from './publicRoutes';

const router = Router();

// Rotas públicas (sem autenticação) - para o bot do Telegram
router.use('/public', publicRoutes);

// Rotas protegidas (com autenticação)
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/categories', categoryRoutes);
router.use('/slas', slaRoutes);
router.use('/users', userRoutes);
router.use('/tickets', ticketRoutes);
router.use('/reports', reportRoutes);

export default router;
