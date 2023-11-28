import Users from "../models/userModel.js"
import { comparePassword, createJWT, hashString } from "../utils/index.js"
import { signupMailVerification } from "../utils/sendMails.js"

//REGISTRATION
export const register = async (req, res)=>{
    try {
        const {
            firstName,
            lastName,
            email,
            password,
        } = req.body

        // VALIDATE FIELDS
        if(!firstName || !lastName || !email || !password){
            return res.status(400).json({
                success: false,
                message: "Please Fill all Fields"
            })
        }

        // CHECK IF USER ALREADY EXIST
        const userExist = await Users.findOne({email})
        if(userExist){
            return res.status(400).json({
                success: false,
                message: "User Already Exist"
            })
        }

        // HASH PASSWORD
        const hashedPassword = await hashString(password)
        
        const user = await Users.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        })

        // SEND VERIFICATION LINK
        signupMailVerification(user, res)
    } catch (error) {
        console.log(error)
        res.status(400).json({message: "Internal Server Error"})
    }
}

// LOGIN
export const login = async (req, res, next)=>{
    try {
        const {email, password} = req.body

        if(!email || !password){
            return res.json({
                success: false,
                message: "Please Fill all Fields"
            }) 
        }

        // FIND USER
        const user = await Users.findOne({email}).select("+password").populate({
            path: "friends",
            select: "firstName lastName profilePicUrl coverPicUrl -password"
        })
        
        if(!user){
            return res.json({
                success: false,
                message: "User not found!"
            }) 
        }
        // CHECK IF ACCOUNT IS VERIFIED
        if(!user?.verified){
            return res.json({
                success: false,
                message: "Account is not verified yet! Please verify your account through the verification link sent to you via email"})
        }

        // COMPARE PASSWORD
        const isMatch = await comparePassword(password, user?.password)
        if(!isMatch){
            return res.json({
                success: false,
                message: "Invalid Password"})
        }
        user.password = undefined
        // CREATE TOKEN
        const token = createJWT(user?._id)

        res.json({
            success: true,
            message: "Login Successfully",
            user,
            token
        })

    } catch (error) {
        console.log(error)
        return res.json({message: error.message})
    }
}