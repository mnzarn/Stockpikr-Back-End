import { NextFunction, Request, Response } from "express";
import { admin } from "./firebaseAdmin";

export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split("Bearer ")[1]; 

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid token", error });
  }
};
