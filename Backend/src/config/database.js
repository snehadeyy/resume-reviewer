import mongoose from "mongoose";

const connectToDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("database connected")
    }
    catch(err){
        console.log("Database failed: ", err)
    }
}

export default connectToDB