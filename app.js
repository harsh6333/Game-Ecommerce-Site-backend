import express from "express";
import mongoose from "mongoose";
import Createuser from "./Routes/CreateUser.js";
import Games from "./models/games.js";
import cors from "cors";
import "dotenv/config";
const app = express();
const PORT =3000;
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your frontend's origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allow the HTTP methods you need
    allowedHeaders: ["Content-Type", "Authorization"], // Allow the "Authorization" header
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
mongoose.connect("mongodb://127.0.0.1:27017/Gamesite", {
  serverSelectionTimeoutMS: 30000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
global.games = await Games.find({});
// console.log(global.games);
app.get("/", (req, res) => {
  res.send("hello");
});
app.use(express.json());
app.use("/api", Createuser);
app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
