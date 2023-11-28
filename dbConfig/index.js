import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const dbConnection = async () =>{
    try {
        const connection = mongoose.connect(process.env.MONGODB_URL)

        console.log("Db Connected")
    } catch (error) {
        console.log("Db Error", error)
    }
}

export default dbConnection