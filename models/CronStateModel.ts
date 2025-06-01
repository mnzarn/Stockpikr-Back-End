import mongoose from 'mongoose';

const CronStateSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., 'fmpLatestStockUpdate'
  lastRunTime: { type: Number, default: 0 },
  apiLimitHit: { type: Boolean, default: false },
  apiLimitResetTime: { type: Number, default: 0 }
});

export const CronStateModel = mongoose.model('CronState', CronStateSchema);
