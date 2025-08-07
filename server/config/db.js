import mongoose from 'mongoose';
export default async function connectDB(){
      try{
            const mongoUri = process.env.MONGODB_URI;
            await mongoose.connect(mongoUri);
            console.log(`MongoDB integration success !!!`);
            console.log(`connected to client: ${process.env.CLIENT_URL || 'http://localhost:5174'}`);
      }catch(error){
            console.error("Failed to connect to MONGODB:", error.message);
            // For development, we'll continue without MongoDB for now
            console.log("Continuing without database connection...");
      }
}
