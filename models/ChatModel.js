import mongoose from "mongoose"

const chatSchema = new mongoose.Schema({
    participants: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users', // Reference to the User model
        required: true,
        },
    ],
    messages: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message', // Reference to the Message model
        },
    ],
    lastMessageTime: {
        type: Date,
        default: null
    }
},
{
    timestamps: true
}

);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;