import dotenv from "dotenv";
dotenv.config();

export const config = {
  FMP_API_KEY: process.env.FMP_API_KEY,
  PORT: process.env.PORT ?? 5000,
  DB_CONNECTION_STRING:
    process.env.DB_CONNECTION_STRING ?? "mongodb+srv://test:test@stockpikr.zrmjvdi.mongodb.net/Users"
};
