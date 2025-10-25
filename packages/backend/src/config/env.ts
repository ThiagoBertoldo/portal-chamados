import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
};

// Validação de variáveis obrigatórias
if (!config.databaseUrl) {
  throw new Error('DATABASE_URL não está definida no arquivo .env');
}

if (config.jwtSecret === 'default-secret-change-me' && config.nodeEnv === 'production') {
  throw new Error('JWT_SECRET deve ser definido em produção');
}
