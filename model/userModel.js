import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  kitId: { type: Number },
  dob: { type: Number },
  patientStatus: { type: String },
});

export default new mongoose.model("User", userSchema, "users");
