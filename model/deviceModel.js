import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  connectedDevices: [
    {
      deviceCode: { type: String },
      deviceName: { type: String },
      imageUrl: { type: String },
      type: { type: String },
      pairStatus: { type: String },
    },
  ],
});

export default new mongoose.model("Device", deviceSchema, "connectedDevices");
