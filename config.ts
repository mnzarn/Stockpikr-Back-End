import dotenv from "dotenv";
dotenv.config();

export const config = {
  FMP_API_KEY: process.env.FMP_API_KEY,
  PORT: process.env.PORT || 80,
  DB_CONNECTION_STRING:
    process.env.DB_CONNECTION_STRING || "mongodb+srv://test:test@stockpikr.zrmjvdi.mongodb.net/Users",
  MONGO_CONN_TIMEOUT: 1000,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CLIENT_URL,
  NODE_ENV: process.env.NODE_ENV || "production"
};
console.log("Google OAuth Config:", {
  GOOGLE_CLIENT_ID: config.GOOGLE_CLIENT_ID ? "Loaded " : "MISSING",
  GOOGLE_CLIENT_SECRET: config.GOOGLE_CLIENT_SECRET ? "Loaded " : "MISSING",
  GOOGLE_CALLBACK_URL: config.GOOGLE_CALLBACK_URL ? "Loaded " : " MISSING"
});
