import admin from "firebase-admin";

const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT || "{}";
const serviceAccount = JSON.parse(rawServiceAccount);

serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export { admin };

