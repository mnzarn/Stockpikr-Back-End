import { Router } from "express";
import { UserModel } from "../models/UserModel";

const userRouterHandler = (Users: UserModel) => {
  const router = Router();

  //Get one user by ID
  // router.get("/:id", async (req, res, next) => {
  //   try {
  //     const id = req.session["uuid"] ? req.session["uuid"] : req.params.id;
  //     const user = await Users.getUserByID(id);
  //     if (user) {
  //       res.json(user);
  //     } else {
  //       res.status(404).json({ error: "User not found" });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user data:", error);
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // });
  router.get("/:id?", async (req, res) => {
    try {
      const id = typeof req.user === "string" ? req.user : req.params.id;
      if (!id) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const user = await Users.getUserByID(id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //Get all users
  router.get("/", async (req, res, next) => {
    try {
      const users = await Users.getUsers();
      if (users.length > 0) {
        res.status(200).json(users);
      } else {
        res.status(404).json({ error: "Users not found" });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //Update user information by ID
  // router.put("/:id", async (req, res, next) => {
  //   try {
  //     const id = req.session["uuid"] ? req.session["uuid"] : req.params.id;
  //     const { firstName, lastName, email, phoneNumber, profilePic } = req.body;

  //     const updatedUser = await Users.updateUser(id, firstName, lastName, email, phoneNumber, profilePic);

  //     res.status(200).json(updatedUser);
  //   } catch (error) {
  //     console.error("Error updating user:", error);
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // });
  router.put("/:id?", async (req, res) => {
    try {
      const id = typeof req.user === "string" ? req.user : req.params.id;
      if (!id) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const { firstName, lastName, email, phoneNumber, profilePic } = req.body;
      
      // Ensure id is a string
      if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const updatedUser = await Users.updateUser(id, firstName, lastName, email, phoneNumber, profilePic);
      
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
};

export default userRouterHandler;
