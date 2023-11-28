import jwt from "jsonwebtoken"


const userAuth = async (req, res, next)=>{
    const authHeader = req?.headers?.authorization

    if(!authHeader || !authHeader?.startsWith("Bearer")){
        res.json({message: "Authorization failed"})
    }

    const token = authHeader?.split(" ")[1]

    try {
        const userToken = jwt.verify(token, process.env.JWT_SECRET_KEY)

        if(userToken){
            req.body.user = {
                userId: userToken.userId
            }
    
            next()
        }else{
            res.json({message: "Authorization failed"})
        }
    } catch (error) {
        console.log(error)
        res.json({message: "Authorization failed"})
    }
}

export default userAuth