import Chat from "../models/ChatModel.js";
import Message from "../models/MessageModel.js";
import {ObjectId} from "mongoose";

export const createChat = async(req, res)=>{
    const newChat = new Chat({
        participants: [req.body.senderId, req.body.receiverId]
    });

    try {
        const result = await newChat.save()
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const userChats = async (req, res)=>{
    try {
        const chats = await Chat.find({participants: req.params.userId})

        const chatWithLatestMessage = await Promise.all(chats.map(async (chat) => {
            const latestMessage = await getLatestMessage(chat._id);
            return { ...chat.toObject(), latestMessage };
        }));

        // Sort the chats by lastMessageTime in descending order
        const sortedChats = chatWithLatestMessage.sort((a, b) => {
            const timeStampA = a.latestMessage ? new Date(a.latestMessage.createdAt) : new Date(a.createdAt);
            const timeStampB = b.latestMessage ? new Date(b.latestMessage.createdAt) : new Date(b.createdAt);
            return timeStampB - timeStampA;
        });

        res.status(200).json(sortedChats);
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const findChat = async (req, res)=>{
    try {
        const chat = await Chat.findOne({
            participants: {$all: [req.params.firstId, req.params.secondId]}
        })
        res.status(200).json(chat)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getLatestMessage = async (chatId) => {
    try {
      //const objectIdChatId = new ObjectId(chatId); // Ensure chatId is a valid ObjectId
  
      const chat = await Chat.findById(chatId).populate({
        path: 'messages',
        options: { sort: { createdAt: -1 }, limit: 1 }, // Sort messages by createdAt in descending order and limit to 1
      });
  
      const latestMessage = chat.messages[0]; // Access the latest message from the array
  
      return latestMessage;
    } catch (error) {
      console.error("Error fetching latest message:", error.message);
      throw error;
    }
  };