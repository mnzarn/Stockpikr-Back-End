import { Router } from "express";
import { admin } from "../services/firebaseAdmin";

const userRouterHandler = () => {
  const router = Router();

  // Get authenticated user details
  router.get("/", async (req, res) => {
    try {
      const firebaseUID = req.user as string;
      const firebaseUser = await admin.auth().getUser(firebaseUID);
      res.json({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        phoneNumber: firebaseUser.phoneNumber,
      });
    } catch (error) {
      console.error("Error fetching Firebase user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
};

export default userRouterHandler;
