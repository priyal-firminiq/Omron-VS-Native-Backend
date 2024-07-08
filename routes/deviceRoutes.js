import express from "express";
import { connectDevice, disconnectDevice, fetchDevices, getConnectDevices, linkKit } from "../controller/deviceController.js";
import { verifyAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/get-devices", fetchDevices);
router.post("/link-kit", verifyAuth, linkKit);
router.post("/pair-device", verifyAuth, connectDevice);
router.post("/unpair-device", verifyAuth, disconnectDevice);
router.get("/get-paired-devices", verifyAuth, getConnectDevices);

export default router;
