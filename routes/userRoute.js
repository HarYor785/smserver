import express from "express"
import { acceptFriendRequest, changePassword, 
    deleteAccount, 
    deleteFriend, 
    deleteFriendRequest, 
    forgotPassword, 
    getFriendRequests, 
    getProfile, 
    passwordResetLink, 
    sendFriendRequest, 
    suggestedFriends, 
    updateProfile, 
    verifyAccount } from "../controllers/userController.js"
import userAuth from "../middleware/authMiddleware.js"


const router = express.Router()

//Verify account
router.get("/verify/:userId/:token", verifyAccount)

// Forgot password
router.post("/forgot-password", forgotPassword)
//Verify password reset link for expiration
router.get("/password-link/:userId/:token", passwordResetLink)
// Change password
router.post("/change-password", changePassword)

// User profile
router.post("/get-profile/:id?", userAuth, getProfile)
//Update user
router.put("/update-profile", userAuth, updateProfile)
//Send friend request
router.post("/friend-request", userAuth, sendFriendRequest)
//Get friends requests
router.get("/get-request", userAuth, getFriendRequests)
//Accept friend request
router.post("/accept-request", userAuth, acceptFriendRequest)
//Delete request
router.delete("/delete-request/:requestId", userAuth, deleteFriendRequest)
//Delete friends
router.delete("/delete-friend/:friendId", userAuth, deleteFriend)
//Get suggested friends
router.get("/suggested-friends", userAuth, suggestedFriends)
//Delete account
router.delete("/delete-account", userAuth, deleteAccount)

export default router