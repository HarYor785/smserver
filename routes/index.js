import express from "express"
import authRouter from "./authRoute.js"
import userRouter from "./userRoute.js"
import postRouter from "./postRoute.js"
import ChatRoute from "./ChatRoute.js"
import MesageRoute from "./MessageRoute.js"


const path = "/api-v1/"
const router = express.Router()

//Authentication route
router.use(`${path}auth`, authRouter)
//User route
router.use(`${path}user`, userRouter)
//Posts route
router.use(`${path}post`, postRouter)

//CHAT ROUTE
router.use(`${path}chat`, ChatRoute)

//MESSAGE ROUTE

router.use(`${path}message`, MesageRoute)


export default router