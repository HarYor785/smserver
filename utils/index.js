import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"

export const hashString = async (value)=>{
    const salt = await bcrypt.genSalt(10)

    const hashed = await bcrypt.hashSync(value, salt)

    return hashed
}

export const comparePassword = async (userPassword, password)=>{
    const compared = await bcrypt.compareSync(userPassword, password)

    return compared
}

export const createJWT = (id)=>{
    return jwt.sign({userId: id}, process.env.JWT_SECRET_KEY, {expiresIn: "1d"})
}