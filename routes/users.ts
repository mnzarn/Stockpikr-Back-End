import { Router } from "express";
import { UserModel } from "../models/UserModel";
import { admin } from "../services/firebaseAdmin";

const userRouterHandler = (Users: UserModel) => {
  const router = Router();

  // Create user if not already in DB
  router.post("/", async (req, res, next) => {
    try {
      const firebaseUID = req.user as string;
      if (!firebaseUID) return res.status(401).json({ error: "Unauthorized: Missing Firebase UID" });

      const firebaseUser = await admin.auth().getUser(firebaseUID);

      let user = await Users.getUserByAuth(firebaseUID);
      if (!user) {
        const [firstName, ...rest] = (firebaseUser.displayName || "").split(" ");
        const lastName = rest.join(" ");

        await Users.addUser(
          firebaseUID,
          firstName || "",
          lastName || "",
          firebaseUser.email || "",
          firebaseUser.phoneNumber || "",
          firebaseUser.photoURL || "",
          false
        );

        user = await Users.getUserByAuth(firebaseUID);
      }

      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Toggle notification setting
  router.patch("/notifications", async (req, res, next) => {
    try {
      const firebaseUID = req.user as string;
      if (!firebaseUID) return res.status(401).json({ error: "Unauthorized: Missing Firebase UID" });

      const { enabled } = req.body;
      if (typeof enabled !== "boolean") {
        return res.status(400).json({ error: "`enabled` must be a boolean." });
      }

      const updatedUser = await Users.setNotifications(firebaseUID, enabled);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating notifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get current user's notifications setting
  router.get("/notifications", async (req, res, next) => {
    try {
      const firebaseUID = req.user as string;
      if (!firebaseUID) return res.status(401).json({ error: "Unauthorized: Missing Firebase UID" });

      const user = await Users.getUserByAuth(firebaseUID);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({ notifications: user.notifications });
    } catch (error) {
      console.error("Error fetching notifications setting:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get authenticated user details
  router.get("/", async (req, res) => {
    try {
      const firebaseUID = req.user as string;
      if (!firebaseUID) {
        return res.status(401).json({ error: "Unauthorized: Missing Firebase UID" });
      }

      const user = await Users.getUserByAuth(firebaseUID);
      if (!user) {
        return res.status(404).json({ error: "User not found in database" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user from database:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
};

export default userRouterHandler;
