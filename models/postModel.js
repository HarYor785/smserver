import mongoose,{Schema,} from "mongoose";

const postSchema = new mongoose.Schema(
    {
        userId: {type: Schema.Types.ObjectId, ref: "Users"},
        description: {type: String, required: true},
        file: {type: String},
        likes: [{type: String}],
        comment: [{type: Schema.Types.ObjectId, ref: "Comments"}]
    },
    {timestamps: true}
)

const Posts = mongoose.model("Posts", postSchema)

export default Posts