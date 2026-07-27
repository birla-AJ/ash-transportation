export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  corsOrigin: (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map((origin) => origin.trim()),

  mongodbUri:
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ash_transportation',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    refreshExpiresInRemember:
      process.env.JWT_REFRESH_EXPIRES_IN_REMEMBER || '90d',
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@ashtransportation.com',
    password: process.env.ADMIN_PASSWORD || 'ChangeMe@123',
    name: process.env.ADMIN_NAME || 'Administrator',
  },

  challan: {
    prefix: process.env.CHALLAN_PREFIX || 'ASH',
    padLength: parseInt(process.env.CHALLAN_PAD_LENGTH ?? '6', 10),
  },

  logLevel: process.env.LOG_LEVEL || 'info',
});
