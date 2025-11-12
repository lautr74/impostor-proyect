import mongoose from "mongoose";


const connectDB = async () => {
try{
  await mongoose.connect(process.env.MONGO_URI)
  console.log("Conectado a MongoDB")
} catch{
    console.error("Imposible conectar a MongoDB")
    process.exit(1)
}
};

export default connectDB;
