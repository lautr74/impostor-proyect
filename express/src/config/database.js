import mongoose from "mongoose";

const connectDB = async (mongoUrl) => {
  try {
    await mongoose.connect(mongoUrl || process.env.MONGO_URI);
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Imposible conectar a MongoDB:", error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

export default connectDB;
