import mongoose, {Schema} from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
    {
        firstName:{
            type: String,
            required: [true, "First name is required"],
        },
        lastName:{
            type: String,
            required: [true, "Last name is required"],
        },
        password:{
            type: String,
            required: [true, "Password is required"],
            minLength: [8, "Password must be at least 8 characters"],
            select: true,
        },
        email:{
            type: String,
            required: [true, "Email is required"],
            unique: true,
            validate: validator.isEmail
        },
        userName:{type: String},
        dateOfBirth:{
            type: Date,
            validate: {
                validator: function(value) {
                    return value <= new Date();
                },
                message: "Date of birth should not be after today",
            }
        },
        gender: {
            type: String,
        },
        mobile:{type: String,},
        location: {type: String},
        profession: {type: String},
        friends: [{type: Schema.Types.ObjectId, ref: "Users"}],
        friendRequests: [{type: Schema.Types.ObjectId, ref: "FriendRequest"}],
        posts: [{type: Schema.Types.ObjectId, ref: "Posts"}],
        bio: {type: String},
        hobbies: {type: String},
        profilePicUrl: {type: String},
        coverPicUrl: {type: String},
        views: [{type: String}],
        verified: {type: Boolean, default: false},
    },
    {timestamps: true}
)

const Users = mongoose.model("Users", userSchema)

export default Users