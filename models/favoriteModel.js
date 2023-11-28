import mongoose, { Schema } from "mongoose";

const favouriteSchema = mongoose.Schema(
    {
        userId: {type: Schema.Types.ObjectId, ref: "Users"},
        postId: [{type: String, default: []}]
    }
)

const Favourite = new mongoose.model("Favourite", favouriteSchema)

export default Favourite