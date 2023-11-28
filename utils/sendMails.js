import nodemailer from "nodemailer"
import dotenv from "dotenv"
import { v4 as uuidv4 } from "uuid"
import { hashString } from "./index.js"
import Verification from "../models/emailVerification.js"
import PasswordReset from "../models/passwordResetModel.js"

dotenv.config()

const {AUTH_EMAIL, AUTH_PASSWORD, APP_URL} = process.env

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "Gmail",
    port: "587",
    auth: {
        user: AUTH_EMAIL,
        pass: AUTH_PASSWORD
    }
})


export const signupMailVerification = async (user, res)=>{
    const {_id, email, lastName} = user

    const token = _id + uuidv4()
    const link = `${APP_URL}verify/${_id}/${token}`

    const mailOption = {
        from: "ConnectMe",
        to: email,
        subject: "Email Verification",
        html: `<div style="padding:20px;border-radius: 5px;font-family: Arial, sans-serif;gap: 5px; background-color: #edf0f3;">

                <h4 style="font-size: 15px;">Hi ${lastName},</h4>

                <p style="font-size: 15px;">
                    Please verify your email address so we can know that it's really you.
                </p>

                <a href=${link} style="color: #fff; padding: 10px; text-decoration: none; 
                    background-color: #1877f2;  border-radius: 8px; font-size: 18px; ">
                    Verify Email Address
                </a>

                <p style="font-size: 15px;">
                    This link will <b>expire in 1hour</b>
                </p>

                <div style="margin-top: 20px;">
                    <h5 style="font-size: 15px;">Best Regards</h5>
                    <h5 style="font-size: 15px;"><b>ConnectMe Team</b></h5>
                </div>
            </div>`
    }
    
    try {
        const hashToken = await hashString(token)

        const mailVerification = await Verification.create({
            userId: _id,
            token: hashToken,
            createdAt: Date.now(),
            expiredAt: Date.now() + 3600000
        })

        if(mailVerification){
            transporter
            .sendMail(mailOption)
            .then(()=>{
                return res.status(200).send({
                    success: true,
                    message: 'A Verification link has been sent to your account, check your email or spam folders'
                })
            })
            .catch((error)=>{
                console.log(error)
                res.status(404).json({
                    success: false,
                    message: error.message,
                })
            })
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({
            status: 'Error',
            message: "Something went wrong",
        })
    }
}

export const resetPasswordLink = async (user, res)=>{
    try {
        const {_id, email} = user
        const token = _id + uuidv4()
        const link = `${APP_URL}password-link/${_id}/${token}`

        const mailOption = {
            from: "ConnectMe",
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="padding:20px;border-radius: 5px;font-family: Arial, sans-serif;gap: 5px;background-color: #edf0f3;">
                    <p style="font-size: 15px;">Dear User</p>
                    <p style="font-size: 15px;">
                        We received a request to reset the password for your account. 
                        If you initiated this request, please click the button below to reset your password:
                    </P>
                    <a href=${link} style="color: #fff; padding: 10px; text-decoration: none; 
                        background-color: #1877f2;  border-radius: 8px; font-size: 18px; ">
                        Reset Password
                    </a>
                    <p style="font-size: 15px;">
                        This password reset link will <b>expire in 10minutes</b>, so please reset your password promptly.
                    </p>
                    <p style="font-size: 15px;">
                        If you did not request a password reset or if you believe this request is in error, 
                        please ignore this email. Your account security is important to us.
                    </p>

                    <div style="margin-top: 20px;">
                        <h5 style="font-size: 15px;">Thank you</h5>
                        <h5 style="font-size: 15px;">ConnectMe</h5>
                    </div>

                </div>`,
        }

        const hashToken = await hashString(token)

        const passwordReset = await PasswordReset.create({
            userId: _id,
            email: email,
            token: hashToken,
            createdAt: Date.now(),
            expiredAt: Date.now() + 600000,
        })
        // CHECK IF PASSWORD RESET MODEL HAS BEEN CREATED
        if(passwordReset){
            //SEND MAIL
            transporter
            .sendMail(mailOption)
            .then(()=>{
                res.json({
                    success: true,
                    message: "Password reset link has been sent to your email address"
                })
            })
            .catch((error)=>{
                console.log(error)
                res.json({
                    success: false,
                    message: "Email Something went wrong"
                })
            })
        }
    } catch (error) {
        console.log(error)
        res.status(404).json({
            success: false,
            message: "Something went wrong",
        })
    }
}