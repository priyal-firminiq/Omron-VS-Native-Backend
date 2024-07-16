import express from "express";
import { connectDevice, pairUnpairDevice,removeConnectdDevice, fetchDevices, getConnectDevices, linkKit } from "../controller/deviceController.js";
import { verifyAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/get-devices",verifyAuth, fetchDevices);
router.post("/link-kit", verifyAuth, linkKit);
router.post("/pair-device", verifyAuth, connectDevice);
router.post("/pair-unpair-device", verifyAuth, pairUnpairDevice);
router.get("/get-paired-devices", verifyAuth, getConnectDevices);
router.post("/remove-device", verifyAuth, removeConnectdDevice);

export default router;
