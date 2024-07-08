import express from "express";
import {
  addKit,
  addBPReading,
  addWeightReading,
  getKitData,
} from "../controller/kitController.js";
import { verifyAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/add-kit", addKit);
router.post("/add-bpReading", addBPReading);
router.post("/add-weightReading", addWeightReading);
router.post("/get-kit", verifyAuth, getKitData);

export default router;
