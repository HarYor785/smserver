// Importing necessary modules and middleware
import express from "express";
import {
    commentPosts,
    createPost,
    deleteComment,
    deletePost,
    deleteReply,
    getComments,
    getPosts,
    getProfilePosts,
    getSavePost,
    getStory,
    likePosts,
    likesPostComment,
    replyComment,
    savePost,
    uploadStory,
} from "../controllers/postController.js";
import userAuth from "../middleware/authMiddleware.js";

// Creating an instance of the Express router
const router = express.Router();

// Defining routes with corresponding controller functions and middleware

//Uploading && Geting story story route
router.post("/upload-story", userAuth, uploadStory);
router.get("/get-story", userAuth, getStory);

//Create a post route
router.post("/create-post", userAuth, createPost);
//Get all posts
router.post("/", userAuth, getPosts);
//Get User Posts
router.post("/:userId", userAuth, getProfilePosts);
//Get posts comments
router.get("/get-comments/:postId", userAuth, getComments);
//Like Post
router.post("/like/:id", userAuth, likePosts);
//Like comment && Reply
router.post("/like-comment/:commentId/:replyId?", userAuth, likesPostComment);
//comment on posts
router.post("/comment/:postId", userAuth, commentPosts);
//Reply comment
router.post("/reply-comment/:commentId", userAuth, replyComment);
//Delete Post
router.delete("/delete-post/:postId", userAuth, deletePost);
//Delete Comment
router.delete("/delete-comment/:commentId", userAuth, deleteComment);
//Delete Reply
router.delete("/delete-reply/:commentId/:replyId", userAuth, deleteReply);
//Save Post
router.post("/save-post/:postId", userAuth, savePost);
//Get Saved Posts
router.get("/getsave-post", userAuth, getSavePost);

// Exporting the router to be used in the main application file
export default router;
