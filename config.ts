import dotenv from "dotenv";
dotenv.config();

export const config = {
  FMP_API_KEY: process.env.FMP_API_KEY,
  PORT: process.env.PORT || 80,
  DB_CONNECTION_STRING:
    process.env.DB_CONNECTION_STRING ||
    "mongodb+srv://sammyzayadi1:3jC8BPiIGn8RXc8m@stockpikrcluster.d4itd.mongodb.net/?retryWrites=true&w=majority&appName=stockpikrcluster",
  MONGO_CONN_TIMEOUT: 1000,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CLIENT_CALLBACK,
  NODE_ENV: process.env.NODE_ENV || "production"
};
