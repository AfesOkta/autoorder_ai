export default () => ({
  port: parseInt(process.env.PORT || "3000", 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  fonnte: {
    apiKey: process.env.FONNTE_API_KEY,
  },
  webhook: {
    apiKey: process.env.WEBHOOK_API_KEY,
  },
  superadmin: {
    apiKey: process.env.SUPERADMIN_API_KEY,
  },
  nodeEnv: process.env.NODE_ENV || "development",
});
