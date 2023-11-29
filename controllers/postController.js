import Comment from "../models/commentModel.js"
import Favourite from "../models/favoriteModel.js"
import Posts from "../models/postModel.js"
import Story from "../models/storyModel.js"
import Users from "../models/userModel.js"


// Controller function to create a new post
export const createPost = async (req, res) => {
    try {
        // Extracting user ID, description, and file from the request body
        const { userId } = req.body.user;
        const { description, file } = req.body;

        //Checking User
        const user = await Users.findById(userId)
        if (!user) return res.json({success: false, message: 'User not found' });

        // Checking if description is provided
        if (!description) {
            return res.json({
                success: false,
                message: "Enter a description"
            });
        }

        // Creating a new post using the Posts model
        const post = await Posts.create({
            userId: userId,
            description,
            file
        });

        // Sending a successful response with the created post data
        res.json({
            success: true,
            message: "Post created successfully",
            data: post
        });

    } catch (error) {
        // Handling and logging any errors that occur during post creation
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

// Controller function to retrieve posts
export const getPosts = async (req, res) => {
    try {
        // Extracting user ID and search query from the request body
        const { userId } = req.body.user;
        const { search } = req.body;

        // Finding the user and extracting their friends' IDs
        const user = await Users.findById(userId);
        const friends = user?.friends?.toString().split(",") ?? [];
        friends.push(userId);

        // Creating a search query based on the provided search term
        const searchQuery = {
            $or: [
                { description: { $regex: search, $options: 'i' } }
            ]
        };

        // Retrieving posts, populating the user data, and sorting by creation date
        const posts = await Posts.find(search ? searchQuery : {})
            .populate({
                path: "userId",
                select: "firstName lastName profilePicUrl -password"
            })
            .sort({ _id: -1 });

        // Filtering posts based on whether the user is friends with the post creator
        const friendsPost = posts?.filter((post) => {
            return friends?.includes(post?.userId?._id.toString());
        });

        //filter friends posts
        const friendsPosts = posts.filter(post => friends.includes(post.userId._id.toString()) && post.userId._id.toString() !== userId);

        //Filter user posts
        const userPosts = posts?.filter((post)=>{
            return post.userId._id.toString() === userId
        })

        //Prioritize user's posts created within the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const recentUserPosts = userPosts.filter((post)=> post.createdAt > oneHourAgo) 

        let postResult = null;

        if(recentUserPosts.length > 0){
            // Separate posts that are not part of recentUserPosts
            const postsNotInRecentUser = posts.filter(post => !recentUserPosts.includes(post));
            postResult = [...recentUserPosts, ...postsNotInRecentUser]
        }else if(friendsPost.length > 0){
            // Separate posts that are not part of friendsPosts
            const postsNotInFriendsAndRecent = posts.filter(post => !friendsPosts.includes(post) && !recentUserPosts.includes(post));
            postResult = search ? friendsPost : [...recentUserPosts, ...friendsPosts, ...postsNotInFriendsAndRecent]
        }else{
            postResult = posts
        } 

        // Sending a successful response with the fetched posts
        res.status(200).json({
            success: true,
            message: "Posts fetched successfully",
            data: postResult
        });

    } catch (error) {
        // Handling and logging any errors that occur during post retrieval
        console.log(error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Controller function to retrieve posts for a specific user profile
export const getProfilePosts = async (req, res) => {
    try {
        // Extracting user ID from the request parameters
        const { userId } = req.params;

        // Retrieving posts for the specified user, populating user data, and sorting by creation date
        const posts = await Posts.find({ userId: userId })
            .populate({
                path: "userId",
                select: "firstName lastName profilePicUrl coverPicUrl -password"
            })
            .sort({ _id: -1 });

        // Sending a successful response with the fetched user posts
        res.status(200).json({
            success: true,
            message: "User posts fetched successfully",
            data: posts
        });
    } catch (error) {
        // Handling and logging any errors that occur during user profile post retrieval
        console.log(error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Controller function to retrieve comments for a specific post
export const getComments = async (req, res) => {
    try {
        // Extracting post ID from the request parameters
        const { postId } = req.params;

        // Retrieving comments for the specified post, populating 
        //user data for commenters and reply users, and sorting by creation date
        const comments = await Comment.find({ postId })
            .populate({
                path: "userId",
                select: "firstName lastName profilePicUrl -password"
            })
            .populate({
                path: "replies.userId",
                select: "firstName lastName profilePicUrl -password"
            })
            .sort({ _id: -1 });

        // Sending a successful response with the fetched comments
        res.status(200).json({
            success: true,
            message: "Comments fetched successfully",
            data: comments
        });
    } catch (error) {
        // Handling and logging any errors that occur during comment retrieval
        console.log(error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Controller function to handle post liking
export const likePosts = async (req, res) => {
    try {
        // Extracting user ID and post ID from the request body and parameters
        const { userId } = req.body.user;
        const { id } = req.params;

        // Finding the post by ID
        const post = await Posts.findById(id);

        // Finding the index of the user's ID in the post's likes array
        const index = post.likes.findIndex((pid) => pid === String(userId));

        // Adding or removing the user's ID from the likes array based on index
        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(index, 1);
        }

        // Updating the post with the modified likes array
        const newPost = await Posts.findByIdAndUpdate(id, post, {
            new: true
        });

        // Sending a successful response with the updated post data
        res.status(200).json({
            success: true,
            message: "Post liked successfully",
            data: newPost
        });
    } catch (error) {
        // Handling and logging any errors that occur during post liking
        console.log(error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Controller function to handle liking comments and replies on a post
export const likesPostComment = async (req, res) => {
    try {
        // Extracting user ID, comment ID, and reply ID from the request body and parameters
        const { userId } = req.body.user;
        const { commentId, replyId } = req.params;

        // Handling liking for comments
        if (replyId === null || replyId === `false` || replyId === undefined) {
            const comment = await Comment.findById(commentId);

            // Finding the index of the user's ID in the comment's likes array
            const index = comment.likes.findIndex((el) => el === String(userId));

            // Adding or removing the user's ID from the likes array based on index
            if (index === -1) {
                comment.likes.push(userId);
            } else {
                comment.likes.splice(index, 1);
            }

            // Updating the comment with the modified likes array
            const newComment = await Comment.findByIdAndUpdate(commentId, comment, {
                new: true
            });

            // Sending a successful response with the updated comment data
            res.status(200).json({
                success: true,
                message: "Comment liked successfully",
                data: newComment
            });
        } else {
            // Handling liking for replies
            const replyComment = await Comment.findOne(
                { _id: commentId },
                {
                    replies: {
                        $elemMatch: {
                            _id: replyId
                        }
                    }
                }
            );

            // Finding the index of the user's ID in the reply's likes array
            const index = replyComment?.replies[0].likes.findIndex((el) => el === String(userId));

            // Adding or removing the user's ID from the likes array based on index
            if (index === -1) {
                replyComment?.replies[0].likes.push(String(userId));
            } else {
                replyComment?.replies[0].likes.splice(index, 1);
            }

            // Updating the reply with the modified likes array
            const query = { _id: commentId, "replies._id": replyId };
            const updatedQuery = {
                $set: {
                    'replies.$.likes': replyComment?.replies[0].likes
                }
            };

            const newReplyLike = await Comment.updateOne(query, updatedQuery, {
                new: true
            });

            // Sending a successful response with the updated reply data
            res.status(200).json({
                success: true,
                message: "Reply liked successfully",
                data: newReplyLike
            });
        }
    } catch (error) {
        // Handling and logging any errors that occur during liking comments or replies
        console.log(error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Controller function to handle commenting on posts
export const commentPosts = async (req, res) => {
    try {
        // Extracting user ID, comment, and post ID from the request body and parameters
        const { userId } = req.body.user;
        const { comment, commentFrom } = req.body;
        const { postId } = req.params;

        // Checking if comment is provided
        if (!comment) {
            return res.json({
                success: false,
                message: "Comment is required"
            });
        }

        // Creating a new comment with the provided data
        const newComment = new Comment({
            userId: userId,
            comment: comment,
            from: commentFrom,
            postId: postId
        });

        // Saving the new comment to the database
        await newComment.save();

        // Finding the post by ID and updating its comments array
        const post = await Posts.findById(postId);
        post.comment.push(newComment._id);

        // Updating the post with the modified comments array
        const updatePost = await Posts.findByIdAndUpdate(postId, post, {
            new: true
        });

        // Sending a successful response with the newly created comment
        res.status(200).json({
            success: true,
            message: "Comment successfully",
            data: newComment
        });
    } catch (error) {
        // Handling and logging any errors that occur during commenting on posts
        console.log(error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Controller function to handle replying to comments
export const replyComment = async (req, res) => {
    try {
        // Extracting user ID, reply content, replyFrom, and comment ID from the request body and parameters
        const { userId } = req.body.user;
        const { comment, commentFrom, replyAt } = req.body;
        const { commentId } = req.params;

        // Checking if reply content is provided
        if (!comment) {
            return res.json({
                success: false,
                message: "Reply is required"
            });
        }

        // Finding the comment by ID and adding the new reply to its replies array
        const commentInfo = await Comment.findById(commentId);
        commentInfo.replies.push({
            userId: userId,
            comment: comment,
            replyAt: replyAt,
            from: commentFrom,
            createdAt: Date.now()
        });

        // Saving the updated comment with the new reply
        commentInfo.save();

        // Sending a successful response with the updated comment data
        res.status(200).json({
            success: true,
            message: "Replied Successfully",
            data: commentInfo
        });
    } catch (error) {
        // Handling and logging any errors that occur during replying to comments
        console.log(error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Controller function to handle deleting a post
export const deletePost = async (req, res) => {
    try {
        // Extracting post ID from the request parameters
        const { postId } = req.params;

        // Deleting the post by ID
        await Posts.findByIdAndDelete(postId);

        // Sending a successful response after deleting the post
        res.status(200).json({
            success: true,
            message: "Post Deleted Successfully"
        });
    } catch (error) {
        // Handling and logging any errors that occur during post deletion
        console.log(error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Controller function to handle uploading a story
export const uploadStory = async (req, res) => {
    try {
        // Extracting user ID and story content from the request body
        const { userId } = req.body.user;
        const { story } = req.body;

        // Creating a new story document with the provided data
        const uploadStory = new Story({
            userId: userId,
            story: story,
        });

        // Saving the new story to the database
        await uploadStory.save();

        // Sending a successful response after uploading the story
        res.status(200).json({
            success: true,
            message: "Story Uploaded Successfully",
            data: uploadStory,
        });
    } catch (error) {
        // Handling and logging any errors that occur during story upload
        console.log(error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Controller function to retrieve stories for a user and their friends
export const getStory = async (req, res) => {
    try {
        // Extracting user ID from the request body
        const { userId } = req.body.user;

        // Retrieving the user's own story, sorting by creation date in descending order, and limiting to the latest story
        const userStory = await Story.findOne({ userId: userId })
            .sort({ createdAt: -1 })
            .limit(1)
            .populate({
                path: "userId",
                select: "firstName lastName profilePicUrl -password"
            });

        // Retrieving the user's friends and their stories, sorting by creation date and user ID, and limiting to the number of friends
        const user = await Users.findById(userId);
        const friendsId = user?.friends || [];

        const fetchStory = await Story.find({ userId: { $in: friendsId } })
            .sort({ createdAt: -1, userId: 1 })
            .limit(friendsId.length)
            .populate({
                path: "userId",
                select: "firstName lastName profilePicUrl -password"
            });

        // Combining the user's own story and their friends' stories into a single array
        let allStories = [];

        if (userStory) {
            allStories.push(userStory);
        }

        allStories = [...allStories, ...fetchStory];

        // Sending a successful response with the fetched stories
        res.status(200).json({
            success: true,
            data: allStories
        });
    } catch (error) {
        // Handling and logging any errors that occur during story retrieval
        console.log(error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Controller function to handle deleting a comment
export const deleteComment = async (req, res) => {
    try {
        // Extracting user ID and comment ID from the request body and parameters
        const { userId } = req.body.user;
        const { commentId } = req.params;

        // Finding the user by ID
        const user = await Users.findById(userId);

        // Checking if the user exists
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        // Finding the comment by ID
        const comment = await Comment.findById(commentId);

        // Checking if the comment exists
        if (!comment) {
            return res.json({
                success: false,
                message: "Comment not found"
            });
        }

        // Extracting the post ID from the comment
        const postId = comment.postId;

        // Finding the post by ID
        const post = await Posts.findById(postId);

        // Checking if the post exists
        if (!post) {
            return res.json({
                success: false,
                message: "Post not found"
            });
        }

        // Finding the index of the comment in the post's comments array and removing it
        const commentIndex = post.comment.indexOf(commentId);
        if (commentIndex !== -1) {
            post.comment.splice(commentIndex, 1);
        }

        // Saving the post after removing the comment reference
        await post.save();

        // Deleting the comment by ID
        await Comment.findByIdAndDelete(commentId);

        // Sending a successful response after deleting the comment
        res.json({
            success: true,
            message: "Comment deleted",
        });

    } catch (error) {
        // Handling and logging any errors that occur during comment deletion
        console.log(error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Controller function to handle deleting a reply to a comment
export const deleteReply = async (req, res) => {
    try {
        // Extracting comment ID and reply ID from the request parameters
        const { commentId, replyId } = req.params;

        // Finding the comment by ID
        const comment = await Comment.findById(commentId);

        // Checking if the comment exists
        if (!comment) {
            return res.json({
                success: false,
                message: "Comment not found"
            });
        }

        // Finding the index of the reply in the comment's replies array
        const index = comment.replies.findIndex((el) => el._id == replyId);

        // Checking if the reply exists
        if (index !== -1) {
            // Removing the reply from the replies array and saving the comment
            comment.replies.splice(index, 1);
            await comment.save();

            // Sending a successful response after deleting the reply
            res.json({
                success: true,
                message: "Reply deleted"
            });
        } else {
            // Sending a response if the reply is not found
            res.json({
                success: true,
                message: "Reply not found"
            });
        }

    } catch (error) {
        // Handling and logging any errors that occur during reply deletion
        console.log(error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Controller function to handle deleting old stories
export const deleteOldStories = async () => {
    try {
        // Calculating the timestamp for 24 hours ago
        const time = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Deleting stories created before the calculated timestamp
        await Story.deleteMany({ createdAt: { $lt: time } });

        // Logging a message indicating successful deletion of old stories
        console.log("Stories deleted");
    } catch (error) {
        // Handling and logging any errors that occur during old stories deletion
        console.log(error);
        // Note: res is not defined here as this function is not handling HTTP requests directly
    }
};

// Controller function to handle saving/unsaving a post
export const savePost = async (req, res) => {
    try {
        // Extracting user ID and post ID from the request body and parameters
        const { userId } = req.body.user;
        const { postId } = req.params;

        // Finding if there is an existing record for saved posts by the user
        const existing = await Favourite.findOne({ userId });

        // If there is an existing record
        if (existing) {
            let message;
            // Finding the index of the post in the saved posts array
            const index = existing.postId.findIndex((el) => el === String(postId));
            // If the post is already saved, remove it; otherwise, add it
            if (index !== -1) {
                existing.postId.splice(index, 1);
                message = "unsaved";
            } else {
                existing.postId.push(postId);
                message = "saved";
            }
            // Saving the updated record
            await existing.save();
            // Sending a response indicating success and whether the post was saved or unsaved
            return res.json({
                success: true,
                message: `Post ${message}`
            });
        } else {
            // If there is no existing record, create a new record with the current post ID
            const savePost = new Favourite({
                userId: userId,
                postId: [postId]
            });
            // Saving the new record
            await savePost.save();
            // Sending a response indicating success and that the post was saved
            res.json({
                success: true,
                message: 'Post saved'
            });
        }
    } catch (error) {
        // Handling and logging any errors that occur during the save/unsave process
        console.log(error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Controller function to handle fetching saved posts for a user
export const getSavePost = async (req, res) => {
    try {
        // Extracting user ID from the request body
        const { userId } = req.body.user;

        // Finding the record of saved posts for the user and populating related data
        const savedPostsData = await Favourite.findOne({ userId }).populate({
            path: "postId",
            model: "Posts",
            select: "description file likes comment createdAt",
            populate: {
                path: "userId",
                model: "Users",
                select: "firstName lastName profilePicUrl"
            }
        }).sort({ _id: -1 });

        // Checking if there are no saved posts data
        if (!savedPostsData) {
            return res.json({
                success: true,
                data: [],
            });
        }

        // Retrieve an array of saved posts
        const savedPosts = Array.isArray(savedPostsData.postId)
            ? savedPostsData.postId
            : [savedPostsData.postId];

        // Sending a response with the retrieved saved posts data
        res.json({
            success: true,
            data: savedPosts
        });
    } catch (error) {
        // Handling and logging any errors that occur during the saved posts retrieval
        console.log(error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};
