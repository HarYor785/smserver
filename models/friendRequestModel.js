import mongoose, {Schema} from "mongoose";

const friendRequestSchema = new mongoose.Schema(
    {
        fromUser: {type: Schema.Types.ObjectId, ref: "Users"},
        toUser: {type: Schema.Types.ObjectId, ref: "Users"},
        status: {type: String, enum: ["pending", "accepted", "rejected"], default: "pending"}
    },
    {timestamps: true}
)

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema)

export default FriendRequest