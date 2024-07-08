import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  addDOB,
  verifyEmail,
  changePassword,
  getProfileInfo,
} from "../controller/userController.js";
import { verifyAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/add-dob", verifyAuth, addDOB);
router.post("/verify-email", verifyEmail);
router.post("/change-password", verifyAuth, changePassword);
router.get("/view-profile", verifyAuth, getProfileInfo);

export default router;
