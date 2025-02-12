import dotenv from "dotenv";

dotenv.config();

export const config = {
  FMP_API_KEY: process.env.FMP_API_KEY || "", 
  PORT: process.env.PORT || 5000,

  // Database Configuration
  DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING || "mongodb+srv://your_username:your_password@your_cluster.mongodb.net/YourDatabase",
  MONGO_CONN_TIMEOUT: Number(process.env.MONGO_CONN_TIMEOUT) || 1000,

  // Authentication
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback",

  // Security
  SESSION_SECRET: process.env.SESSION_SECRET || "your_random_secret_key",

  // Frontend URL for CORS
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Environment Mode
  NODE_ENV: process.env.NODE_ENV || "production",
};
