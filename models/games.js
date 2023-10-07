// models/game.js
import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  id: Number,
  num: Number,
  name: String,
  image: String,
  image1: String,
  image2: String,
  image3: String,
  price: String,
  trailer: String,
});
export default mongoose.model("Games", gameSchema);
