import MessageModel from "../models/MessageModel.js";
import Chat from "../models/ChatModel.js"

export const addMessage = async (req, res)=>{

    try {
        const {chatId, senderId, text, attachment} = req.body

        const message = new MessageModel({
            senderId,
            text,
            attachment
        })

        const result = await message.save()

        await Chat.findByIdAndUpdate(chatId, {
            $push: {messages: result._id},
            $set: {lastMessageTime: new Date()}
        })

        res.status(200).json(result)

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getMessages = async (req, res)=>{
    try {
        const {chatId} = req.params
        const chat = await Chat.findById(chatId).populate({
            path:'messages',})
        const messages = chat ? chat.messages : []
        res.status(200).json(messages)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const updatMessageStatus = async (req, res)=>{
    try {
        const {messageId, status} = req.body
        const updatedMessage = await MessageModel.findByIdAndUpdate(messageId, 
            {status: status}, {new: true})
        
        res.status(200).json(updatedMessage)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const unreadMessages = async (req, res)=>{
    try {
        const {userId} = req.body.user
        const userChats = await Chat.find({participants: userId})
console.log(userChats)
        const unreadMessagesPromise = userChats.map(async (chat)=>{
            const unreadMessages = await MessageModel.find({
                senderId: chat,
                status: 'unread',
                senderId: {$ne: userId}
            })
            return unreadMessages
        })

        const unreadMessagesArray = await Promise.all(unreadMessagesPromise)
        const allUnreadMessages = unreadMessagesArray.flat()

        res.status(200).json(allUnreadMessages)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}