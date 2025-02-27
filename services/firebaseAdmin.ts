import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const base64Encoded = process.env.FIREBASE_SERVICE_ACCOUNT || "";
const jsonString = Buffer.from(base64Encoded, "base64").toString("utf-8");

const serviceAccount = JSON.parse(jsonString);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export { admin };

