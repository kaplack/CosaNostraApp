import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  dbSyncAlter: process.env.DB_SYNC_ALTER !== 'false',
  jwtSecret: process.env.JWT_SECRET || 'dev-cosanostra-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@cosanostra.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  adminName: process.env.ADMIN_NAME || 'Cosa Nostra Admin',
  awsRegion: process.env.AWS_REGION,
  awsS3Bucket: process.env.AWS_S3_BUCKET,
  awsS3PizzaPrefix: process.env.AWS_S3_PIZZA_PREFIX || 'pizza_img',
  awsS3IngredientPrefix: process.env.AWS_S3_INGREDIENT_PREFIX || 'ingredient_img',
  awsS3PaymentPrefix: process.env.AWS_S3_PAYMENT_PREFIX || 'payment_proofs',
  awsS3PaymentQrPrefix: process.env.AWS_S3_PAYMENT_QR_PREFIX || 'payment_qr',
  signedUrlExpiresIn: Number(process.env.SIGNED_URL_EXPIRES_IN || 3600),
};

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}
