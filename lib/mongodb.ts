import mongoose from "mongoose";

export const dbConnect = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI as string,{
            dbName:"ChatbotExtension"
        })
    } catch (error) {
        console.log((error as Error).message)
    }
}