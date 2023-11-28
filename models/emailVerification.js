import mongoose,{Schema} from "mongoose";

const verificationSchema = new mongoose.Schema(
    {
        userId: String,
        token: String,
        createdAt: Date,
        expiredAt: Date,
    }
)

const Verification = mongoose.model("Verification", verificationSchema)

export default Verification