import mongoose from "mongoose";

const kitSchema = new mongoose.Schema({
  kitId: { type: Number, required: true },
  bpReadings: [
    {
      sys: { type: Number, required: true },
      dia: { type: Number, required: true },
      pulse: { type: Number, required: true },
      readingDate: { type: Number, required: true },
    },
  ],
  weightReadings: [
    {
      lbs: { type: Number, required: true },
      readingDate: { type: Number, required: true },
    },
  ],
});

export default new mongoose.model("Kit", kitSchema, "kits");
