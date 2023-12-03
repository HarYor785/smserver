import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users', // Reference to the User model
        required: true,
        },
    text: {
        type: String,
        required: true,
    },
    attachment: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['unread', 'read'],
        default: 'unread',
    },
});
    
    const Message = mongoose.model('Message', messageSchema);
    
    export default Message;