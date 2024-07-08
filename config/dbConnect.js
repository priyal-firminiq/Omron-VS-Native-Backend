import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_DB_URI, {
      dbName: "native_database",
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDatabase;
