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
    origin: "http://localhost:5173",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header(
    "Access-Control-Allow-Headers-Authorization",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

global.games = []; // Initialize the global.games variable

async function connectToDatabase() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/Gamesite", {
      serverSelectionTimeoutMS: 30000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

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

app.get("/", (req, res) => {
  res.send("Hello");
});

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
