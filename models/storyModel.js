import mongoose, { Schema } from "mongoose";


const storySchema = new mongoose.Schema(
    {
        userId: {type: Schema.Types.ObjectId, ref: "Users"},
        story: {type: String, required: true},
        createdAt: {type: Date, default: Date.now()}
    }
)

const Story = mongoose.model("Story", storySchema)

export default Story