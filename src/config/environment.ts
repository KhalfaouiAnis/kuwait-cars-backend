import dotenv from "dotenv";
import z from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .optional()
    .default("development"),
  PORT: z.coerce.number().optional().default(5000),
  HOST: z.string().optional().default("localhost"),

  // Database
  DATABASE_URL: z.string(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.coerce.number().optional().default(5432),
  DB_NAME: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),

  //   SOCIAL
  GOOGLE_CLIENT_ID: z.string(),
  FACEBOOK_APP_SECRET: z.string(),
  APPLE_CLIENT_ID: z.string(),
  APPLE_TEAM_ID: z.string().optional(),

  WHATSAPP_TOKEN: z.string(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_ID: z.string(),
  WHATSAPP_VERSION: z.string(),

  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRATION: z.string().default("7d"),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRATION: z.string().default("30d"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().optional().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().optional().default(100),

  // CORS (defaults to APP_BASE_URL if not specified)
  CORS_ORIGIN: z.string().optional().default("http://localhost:5000"),

  // CLOUDINARY
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  APP_BASE_URL: z.string().optional().default("http://localhost:5000"),

  SENDGRID_API_KEY: z.string(),
  SENDGRID_FROM_EMAIL: z.email(),

  // DO
  CRON_SECRET: z.string().optional(),
  PROD_APP_URL: z.string().optional().default(""),
});

const { error, data: envVars } = envSchema.safeParse(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  host: envVars.HOST,

  database: {
    schema: envVars.DATABASE_URL,
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    name: envVars.DB_NAME,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
  },

  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRATION,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRATION,
  },

  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX_REQUESTS,
  },

  cors: {
    origin: envVars.CORS_ORIGIN,
  },

  app: {
    baseUrl: envVars.APP_BASE_URL,
  },

  oauth: {
    facebookAppSecret: envVars.FACEBOOK_APP_SECRET,
    googleClientId: envVars.GOOGLE_CLIENT_ID,
    appleClientId: envVars.APPLE_CLIENT_ID,
    appleTeamId: envVars.APPLE_TEAM_ID,
  },

  whatsapp: {
    token: envVars.WHATSAPP_TOKEN,
    verifyToken: envVars.WHATSAPP_VERIFY_TOKEN,
    phoneId: envVars.WHATSAPP_PHONE_ID,
    version: envVars.WHATSAPP_VERSION,
  },

  email: {
    sendgridApiKey: envVars.SENDGRID_API_KEY,
    sendgridFromEmail: envVars.SENDGRID_FROM_EMAIL || "no-reply@xcars.com",
  },

  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },

  do: {
    cronSecret: envVars.CRON_SECRET,
    appUrl: envVars.PROD_APP_URL,
  },
};
