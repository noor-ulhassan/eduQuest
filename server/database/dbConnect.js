import mongoose from "mongoose";

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected");
    } catch(error){
        console.log("Error connecting database",error);

    }
    
}

export default connectDB;