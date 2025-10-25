import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const generateToken = (payload: { id: string; email: string; role: string }): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};
