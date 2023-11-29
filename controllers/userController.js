import Comment from "../models/commentModel.js"
import Verification from "../models/emailVerification.js"
import FriendRequest from "../models/friendRequestModel.js"
import PasswordReset from "../models/passwordResetModel.js"
import Posts from "../models/postModel.js"
import Story from "../models/storyModel.js"
import Users from "../models/userModel.js"
import { createJWT, hashString } from "../utils/index.js"
import { resetPasswordLink } from "../utils/sendMails.js"


// Verification of user account through email verification link
export const verifyAccount = async (req, res) => {
    const { userId, token } = req.params;

    try {
        const verificationRecord = await Verification.findOne({ userId });

        if (verificationRecord) {
            const { expiredAt, token: hashToken } = verificationRecord;

            // Check if the verification link has expired
            if (expiredAt < Date.now()) {
                await Promise.all([
                    Verification.findOneAndDelete({ userId }),
                    Users.findOneAndDelete({ userId }),
                ]);

                return res.json({
                    success: false,
                    message: "Verification link has expired",
                });
            }

            // Check if the provided token is valid
            const isTokenValid = await hashString(token, hashToken);

            if (isTokenValid) {
                // Mark user as verified and remove verification record
                await Promise.all([
                    Users.findOneAndUpdate({ _id: userId }, { verified: true }),
                    Verification.findOneAndDelete({ userId }),
                ]);

                return res.json({
                    success: true,
                    message: "Email verified successfully",
                });
            } else {
                return res.json({
                    success: false,
                    message: "Invalid verification link",
                });
            }
        } else {
            return res.json({
                success: false,
                message: "Invalid verification link, Try again",
            });
        }
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Forgot password functionality
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user with the provided email
        const user = await Users.findOne({ email });

        // Check if the user exists
        if (!user) {
            return res.json({
                success: false,
                message: "User not found",
            });
        }

        // Check if there is an existing password reset request for the user
        const existingRequest = await PasswordReset.findOne({ email });

        if (existingRequest) {
            // Check if the existing request is still valid (not expired)
            if (existingRequest.expiredAt > Date.now()) {
                return res.json({
                    success: false,
                    message: "Password reset request already sent",
                });
            }

            // If the request is expired, delete it to create a new one
            await PasswordReset.findOneAndDelete({ email });
        }

        // Generate and send a password reset link
        await resetPasswordLink(user, res);
        
    } catch (error) {
        console.log(error);
        res.json({ message: error.message });
    }
};

// Password reset link verification
export const passwordResetLink = async (req, res) => {
    const { userId, token } = req.params;

    try {
        // Find the user by userId
        const user = await Users.findById(userId);

        // Check if the user exists
        if (!user) {
            const message = "Invalid Password reset link, Try again.";
            return res.json({
                status: "error",
                message: message,
            });
        }

        // Find the corresponding password reset record
        const passwordReset = await PasswordReset.findOne({ userId });

        // Check if the password reset record exists
        if (!passwordReset) {
            const message = "Invalid Password reset link, Try again.";
            return res.json({
                status: "error",
                message: message,
            });
        }

        const { expiredAt, token: hashToken } = passwordReset;

        // Check if the password reset link has expired
        if (expiredAt < Date.now()) {
            const message = "Password reset link has expired.";
            return res.json({
                status: "error",
                message: message,
            });
        } else {
            // Check if the provided token matches the stored hashToken
            const isMatch = await hashString(token, hashToken);

            if (!isMatch) {
                const message = "Invalid Password reset link, Try again.";
                return res.json({
                    status: "error",
                    message: message,
                });
            } else {
                // If everything is valid, send success status and user id
                return res.json({
                    status: "success",
                    id: userId,
                });
            }
        }
    } catch (error) {
        console.log(error);
        const message = "Internal server error.";
        return res.json({
            status: "error",
            message: message,
        });
    }
};

// Change password
export const changePassword = async (req, res) => {
    const { userId, password } = req.body;

    try {
        // Hash the new password
        const hashPassword = await hashString(password);

        // Update the user's password in the database
        const user = await Users.findByIdAndUpdate({ _id: userId }, { password: hashPassword });

        // Check if the user exists
        if (user) {
            // If the user exists, delete the corresponding password reset record
            await PasswordReset.findOneAndDelete({ userId });

            return res.json({
                success: true,
                message: "Password has been changed successfully",
            });
        }
    } catch (error) {
        console.log(error);
        // If an error occurs, return a failure response with the error message
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

// Get profile endpoint
export const getProfile = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { id } = req.params;

        // Find the user by ID, if not provided, use the authenticated user's ID
        const user = await Users.findById(id ?? userId).populate({
            path: "friends",
            select: "-password"
        });

        // Check if the user exists
        if (!user) {
            return res.status(200).send({
                success: false,
                message: "User not found",
            });
        }

        // Remove the password from the user object
        user.password = undefined;

        // Create a new JWT token for the user
        const token = createJWT(user?._id);

        // Return a success response with the user details and token
        res.status(200).json({
            success: true,
            user,
            token,
        });
    } catch (error) {
        console.log(error);
        // If an error occurs, return a failure response with the error message
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Update profile endpoint
export const updateProfile = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            userName,
            mobile,
            location,
            bio,
            profession,
            dateOfBirth,
            hobbies,
            profilePicUrl,
            coverPicUrl
        } = req.body;

        const { userId } = req.body.user;

        // Check if required fields are provided
        if (!firstName || !lastName || !email || !mobile || !location || !bio || !profession) {
            return res.status(400).json({
                success: false,
                message: "Please provide required fields"
            });
        }

        // Create an object with updated profile information
        const updateProfile = {
            firstName,
            lastName,
            userName,
            email,
            mobile,
            location,
            bio,
            profession,
            dateOfBirth,
            hobbies,
            profilePicUrl,
            coverPicUrl,
            _id: userId,
        };

        // Find and update the user's profile information
        const user = await Users.findByIdAndUpdate(userId, updateProfile, {
            new: true,
        }).populate({
            path: 'friends',
            select: '-password'
        });

        // Create a new JWT token for the updated user
        const token = createJWT(user._id);

        // Remove the password from the user object
        user.password = undefined;

        // Return a success response with the updated user details and token
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
            token,
        });

    } catch (error) {
        console.log(error);
        // If an error occurs, return a failure response with the error message
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Send friend request endpoint
export const sendFriendRequest = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { requestTo } = req.body;

        // Check if both users exist
        const userToExist = await Users.findById(userId);
        const userFromExist = await Users.findById(requestTo);

        if (!userFromExist || !userToExist) {
            return res.status(200).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if a friend request has already been sent
        const friendExist = await FriendRequest.findOne({
            fromUser: userId,
            toUser: requestTo,
            status: 'pending'
        });

        if (friendExist) {
            return res.status(200).json({
                success: false,
                message: "Friend request already sent!"
            });
        }

        // Create a new friend request
        const newRequest = await FriendRequest.create({
            fromUser: userId,
            toUser: requestTo,
        });

        // Add the friend request to the recipient's user data
        await Users.findByIdAndUpdate(requestTo, {
            $addToSet: { friendRequests: newRequest.fromUser }
        });

        // Return a success response
        res.status(200).json({
            success: true,
            message: 'Friend request sent'
        });

    } catch (error) {
        console.log(error);
        // If an error occurs, return a failure response with the error message
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Get friend requests endpoint
export const getFriendRequests = async (req, res) => {
    try {
        const { userId } = req.body.user;

        // Find the user by ID
        const user = await Users.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.json({
                success: false,
                message: "User not found",
            });
        }

        // Retrieve pending friend requests for the user
        const requests = await FriendRequest.find({
            toUser: userId,
            status: 'pending'
        }).populate({
            path: 'fromUser',
            select: "firstName lastName profilePicUrl userName -password"
        }).limit(10).sort({_id: -1});

        // Return a success response with the friend requests data
        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.log(error);
        // If an error occurs, return a failure response with the error message
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Accept friend request endpoint
export const acceptFriendRequest = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { id } = req.body;

        // Find the user by ID
        const user = await Users.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        // Find the friend request by ID
        const friendRequest = await FriendRequest.findById(id);

        // Check if the friend request exists and is still pending
        if (!friendRequest || friendRequest.status !== 'pending') {
            return res.json({ message: "Friend request not found or already handled" });
        }

        // Update the friend request status to 'accepted'
        const updatedRequest = await FriendRequest.findByIdAndUpdate(
            { _id: id },
            { status: 'accepted' }
        );

        // If the update is successful, proceed with updating the friends list for both users
        if (updatedRequest) {
            const friendId = updatedRequest.fromUser;

            // Update the friends list for the user accepting the request
            await Users.findByIdAndUpdate(updatedRequest.toUser, {
                $push: { friends: updatedRequest.fromUser }
            });

            // Update the friends list for the user who initiated the request
            await Users.findByIdAndUpdate(updatedRequest.fromUser, {
                $push: { friends: updatedRequest.toUser }
            });

            // Remove the friend request from the user's pending friend requests
            await Users.findByIdAndUpdate(userId, {
                $pull: { friendRequests: friendId }
            });

            // Generate a new JWT token
            const token = createJWT(user._id);
            user.password = undefined;

            // Return a success response with the updated user data and token
            res.status(200).json({
                success: true,
                message: "Friend request accepted successfully",
                user,
                token
            });
        }
    } catch (error) {
        console.log(error);
        // If an error occurs, return a failure response with the error message
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Delete friend request endpoint
export const deleteFriendRequest = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { requestId } = req.params;

        // Find the user and friend by their IDs
        const user = await Users.findById(userId);
        const friend = await Users.findById(requestId);

        // Check if the user and friend exist
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        if (!friend) {
            return res.json({
                success: false,
                message: "Friend not found"
            });
        }

        // Find the index of the friend request in the user's pending friend requests
        const index = user.friendRequests.indexOf(requestId);

        // If the friend request is found, remove it from the user's pending friend requests
        if (index !== -1) {
            user.friendRequests.splice(index, 1);
        }

        // Save the updated user data
        await user.save();

        // Delete the friend request (both directions) with 'pending' status
        await FriendRequest.deleteOne({
            $or: [
                { fromUser: userId, toUser: requestId },
                { fromUser: requestId, toUser: userId }
            ],
            status: 'pending'
        });

        // Return a success response
        res.status(200).json({
            success: true,
            message: "Friend request deleted successfully"
        });
    } catch (error) {
        console.log(error);
        // If an error occurs, return a failure response with the error message
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Delete friend endpoint
export const deleteFriend = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { friendId } = req.params;

        // Find the user and friend by their IDs
        const user = await Users.findById(userId);
        const friend = await Users.findById(friendId);

        // Check if the user and friend exist
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        if (!friend) {
            return res.json({
                success: false,
                message: "Friend not found"
            });
        }

        // Find the index of the friend in the user's friends list
        const index = user.friends.indexOf(friendId);

        // If the friend is found, remove it from the user's friends list
        if (index !== -1) {
            user.friends.splice(index, 1);
        }

        // Find the index of the user in the friend's friends list
        const index2 = friend.friends.indexOf(userId);

        // If the user is found, remove it from the friend's friends list
        if (index2 !== -1) {
            friend.friends.splice(index2, 1);
        }

        // Save the updated user and friend data
        await Promise.all([user.save(), friend.save()]);

        // Delete the friend request (both directions) with 'accepted' status
        await FriendRequest.deleteOne({
            $or: [
                { fromUser: userId, toUser: friendId },
                { fromUser: friendId, toUser: userId }
            ],
            status: "accepted"
        });

        // Create a new JWT token for the user (optional, depending on your implementation)
        const token = createJWT(user._id);
        user.password = undefined;

        // Return a success response with updated user data and token
        res.status(200).json({
            success: true,
            message: "Friend deleted",
            token,
            user
        });
    } catch (error) {
        console.log(error);
        // If an error occurs, return a failure response with the error message
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const suggestedFriends = async (req, res) => {
    try {
        const { userId } = req.body.user;

        // Find friend requests where the user is either the sender or receiver
        const existingRequest = await FriendRequest.find({
            $or: [{ fromUser: userId }, { toUser: userId }],
        });

        if (!existingRequest || existingRequest.length === 0) {
            // Fetch friends and friend requests of the user
            const user = await Users.findById(userId);
            const userFriends = user.friends || [];
            const userFriendRequests = user.friendRequests || [];

            // Create the query object
            const queryObject = {
                _id: { $ne: userId },
                friends: { $nin: [...userFriends, ...userFriendRequests] },
            };

            // Execute the query and limit the result to 10 users
            const queryResult = await Users.find(queryObject)
                .limit(10)
                .select("firstName lastName userName profilePicUrl friendRequests -password");

            // Get suggested friends from the query result
            const suggestedFriends = queryResult;

            // Return a success response with the suggested friends
            res.json({
                success: true,
                data: suggestedFriends,
            });
        } else {
            // If there are existing friend requests, handle it accordingly
            res.json({
                success: true,
                data: [], // You might want to adjust this based on your logic
            });
        }
    } catch (error) {
        console.log(error);

        // If an error occurs, return a failure response with the error message
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete account endpoint
export const deleteAccount = async (req, res) => {
    try {
        const { userId } = req.body.user;

        // Delete all posts created by the user
        await Posts.deleteMany({ userId: userId });

        // Delete all comments made by the user on any post
        await Comment.deleteMany({ userId: userId });

        // Delete all stories uploaded by the user
        await Story.deleteMany({ userId: userId });

        // Delete any pending or received friend requests involving the user
        await FriendRequest.findOneAndDelete({ userId });

        // Delete the user's account
        await Users.findByIdAndDelete(userId);

        // Return a success response
        res.json({
            success: true,
            message: "Your account has been deleted"
        });

    } catch (error) {
        console.log(error);

        // If an error occurs, return a failure response with the error message
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
