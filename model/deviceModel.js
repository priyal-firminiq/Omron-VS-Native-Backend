import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  connectedDevices: { type: Array, required: true },
});

export default new mongoose.model("Device", deviceSchema, "connectedDevices");
