import express from "express"
import authRouter from "./authRoute.js"
import userRouter from "./userRoute.js"
import postRouter from "./postRoute.js"


const path = "/api-v1/"
const router = express.Router()

//Authentication route
router.use(`${path}auth`, authRouter)
//User route
router.use(`${path}user`, userRouter)
//Posts route
router.use(`${path}post`, postRouter)


export default router