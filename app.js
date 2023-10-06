import express from "express";
import mongoose from "mongoose";
import Createuser from "./Routes/CreateUser.js";
import DisplayData from "./Routes/DisplayData.js"; // Import DisplayData route
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

mongoose.connect("mongodb://127.0.0.1:27017/Gamesite");

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use(express.json());

app.use("/api", Createuser);
app.use("/api", DisplayData);

app.listen(PORT, async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/Gamesite", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    global.games = await Games.find({});
    console.log(`Connected to MongoDB and server running on port ${PORT}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
});
