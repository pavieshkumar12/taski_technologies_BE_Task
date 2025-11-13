import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./src/config/db.js";
import router from './src/routes/allRoutes.js';

dotenv.config();
const app = express();

//Middleware's
app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

// Connect to MongoDB
await connectDB();

//use routes
app.use(router);

app.get("/", (res) => {
    res.send("🚀 Welcome to LibraryMangement BE APIS 🚀")
})

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
