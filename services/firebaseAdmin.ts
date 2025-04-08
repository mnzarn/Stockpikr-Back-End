import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync(new URL("../serviceAccount.json", import.meta.url), "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export { admin };