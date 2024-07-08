import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import connectDatabase from "./config/dbConnect.js";
import user from "./routes/userRoutes.js";
import device from "./routes/deviceRoutes.js";
import kit from "./routes/kitRoutes.js";

dotenv.config();
const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());
connectDatabase();
app.use("/api", user);
app.use("/api", device);
app.use("/api", kit);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on PORT:${PORT}`);
});
