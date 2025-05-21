import dotenv from "dotenv";
dotenv.config();

export const config = {
  FMP_API_KEY: process.env.FMP_API_KEY,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  PORT: process.env.PORT || 80,
  DB_CONNECTION_STRING:
    process.env.DB_CONNECTION_STRING || "mongodb+srv://test:test@stockpikr.zrmjvdi.mongodb.net/Users",
  MONGO_CONN_TIMEOUT: 1000,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: "http://stockpikr.westus.cloudapp.azure.com:5000/auth/google/callback",
  NODE_ENV: process.env.NODE_ENV || "production"
};