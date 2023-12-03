import express from "express"
import { addMessage, getMessages, unreadMessages, updatMessageStatus } from "../controllers/MessageContoller.js"
import userAuth from "../middleware/authMiddleware.js"
const router = express.Router()

router.post("/",userAuth, addMessage)
router.get("/:chatId",userAuth, getMessages)
router.post("/read",userAuth, updatMessageStatus)
router.get("/unread",userAuth, unreadMessages)

export default router