import express from "express";
import mongoose from "mongoose";
import Createuser from "./Routes/CreateUser.js";
import Games from "./models/games.js";
import cors from "cors";
import "dotenv/config";
const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: `${process.env.BASE_URL}`,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", `${process.env.BASE_URL}`);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

global.games = []; // Initialize the global.games variable

async function connectToDatabase() {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.xrynsi5.mongodb.net/Gamesite`
    );

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

async function fetchGamesFromDatabase() {
  try {
    global.games = await Games.find({}).maxTimeMS(30000);
    console.log("Fetched games from MongoDB");
  } catch (error) {
    console.error("Error fetching games from MongoDB:", error);
  }
}

app.use(express.json());
app.use("/api", Createuser);

connectToDatabase()
  .then(fetchGamesFromDatabase)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error starting the server:", error);
  });
