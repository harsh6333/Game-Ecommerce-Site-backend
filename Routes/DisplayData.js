import express from "express";
const router = express.Router();
import User from "../models/user.js";
router.post("/get-user-data", (req, res) => {
  try {
    User.find({});
  } catch (error) {}
});

export default router;
