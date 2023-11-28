import mongoose, {Schema} from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        userId: {type: Schema.Types.ObjectId, ref: "Users"},
        postId: {type: Schema.Types.ObjectId, ref: "Posts"},
        comment: {type: String, required: true},
        from: {type: String, required: true},
        likes: [{type: String}],
        replies: [
            {
                replyId: {type: Schema.Types.ObjectId},
                userId: {type: Schema.Types.ObjectId, ref: "Users"},
                replyAt: {type: String},
                comment: {type: String},
                from: {type: String},
                createAt: {type: Date, default: Date.now()},
                updateAt: {type: Date, default: Date.now()},
                likes: [{type: String}],
            }
        ],
    },
    {timestamps: true}
)

const Comment = mongoose.model("Comments", commentSchema)

export default Comment