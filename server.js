// Importing required modules
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";
import xss from "xss-clean";
import ExpressMongoSanitize from "express-mongo-sanitize";
import dotenv from "dotenv";
import dbConnection from "./dbConfig/index.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import router from "./routes/index.js";
import { deleteOldStories } from "./controllers/postController.js";
import path from "path";

// Define the current directory
const __dirname = path.resolve(path.dirname(""));

// Load environment variables
dotenv.config();

// Create an instance of the Express application
const app = express();

// Set the port for the server to run on
const PORT = process.env.PORT || 8008;

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'views', 'build')));

// Route for serving the React app for specific paths
app.get("/verified", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'build', 'index.html'));
});

app.get("/verify/:userId/:token", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'build', 'index.html'));
});

app.get("/changePassword/:userId", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'build', 'index.html'));
});

app.get("/password-link/:_id/:token", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'build', 'index.html'));
});

// Middleware for enhancing server security
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(ExpressMongoSanitize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));

// HTTP request logger
app.use(morgan("dev"));

// Establish a connection to the database
dbConnection();

// Periodically delete old stories to manage storage
setInterval(deleteOldStories, 24 * 60 * 60 * 1000);

// Set up routes for the application
app.use(router);

// Middleware to handle errors
app.use(errorMiddleware);

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
