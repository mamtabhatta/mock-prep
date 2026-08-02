import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:5174',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/mock_prep_db',
  jwtSecret: process.env.JWT_SECRET || 'mock_prep_super_secret_jwt_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  hashSaltRounds: parseInt(process.env.HASH_SALT_ROUNDS || '10', 10),
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
};
