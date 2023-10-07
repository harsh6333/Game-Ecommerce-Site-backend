import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import Games from "../models/games.js";
import { body, validationResult } from "express-validator";
import User from "../models/user.js";

const router = express.Router();

router.post(
  "/createuser",
  [
    body("email", "Please Enter valid Email").isEmail(),
    body("Username").isLength({ min: 5 }),
    body(
      "password",
      "Your Password should have at least 5 characters"
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const salt = await bcrypt.genSalt(10);
    let securePassword = await bcrypt.hash(req.body.password, salt);
    try {
      await User.create({
        Username: req.body.Username,
        email: req.body.email,
        password: securePassword,
      });
      console.log("User created successfully");
      res.json({
        success: true,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.json({
        success: false,
      });
    }
  }
);

router.post("/loginuser", async (req, res) => {
  let Username = req.body.Username;
  try {
    let UserData = await User.findOne({ Username }).maxTimeMS(30000);
    if (!UserData) {
      return res.status(400).json({ errors: "User Doesn't Exist" });
    }
    const pwdCompare = await bcrypt.compare(
      req.body.password,
      UserData.password
    );
    if (!pwdCompare) {
      return res.status(400).json({ errors: "Please Enter Correct Password" });
    }
    const data = {
      user: {
        id: UserData.id,
      },
    };

    const authToken = jwt.sign(data, process.env.JWT_SECRET);
    console.log(authToken);
    return res.json({ success: true, authToken: authToken });
  } catch (error) {
    console.error("Error creating user:", error);
    res.json({
      success: false,
    });
  }
});

const verifyToken = (req, res, next) => {
  const authToken = req.header("Authorization");
  if (!authToken) {
    return res.status(401).json({ errors: "Access denied. Please log in." });
  }

  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

    req.userId = decoded.user.id;
    next();
  } catch (error) {
    res.status(400).json({ errors: "Invalid token." });
  }
};

router.get("/get-user", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).maxTimeMS(30000);

    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }

    res.json({ username: user.Username, email: user.email });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ errors: "Server error." });
  }
});

router.post("/add-to-cart", verifyToken, async (req, res) => {
  try {
    const { num, name, image, price } = req.body;
    const user = await User.findById(req.userId).maxTimeMS(30000);

    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }

    const cartItem = {
      num,
      name,
      image,
      price: 99, // You can customize the price as needed
    };

    user.cart.push(cartItem);
    await user.save();

    console.log(`Item added to cart for user: ${user.Username}`);
    res.json({
      success: true,
      message: "Item added to cart successfully.",
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ errors: "Server error. Could not add to cart." });
  }
});

router.get("/get-cart-items", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).maxTimeMS(30000);

    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }

    res.json({ cartItems: user.cart });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ errors: "Server error." });
  }
});

router.post("/remove-from-cart", verifyToken, async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findById(req.userId).maxTimeMS(30000);

    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }

    user.cart = user.cart.filter((item) => item._id.toString() !== itemId);
    await user.save();

    console.log(`Item removed from cart for user: ${user.Username}`);
    res.json({
      success: true,
      message: "Item removed from cart successfully.",
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res
      .status(500)
      .json({ errors: "Server error. Could not remove item from cart." });
  }
});

router.get("/get-games", async (req, res) => {
  try {
    const games = await Games.find().maxTimeMS(30000);
    res.json({ games });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const gameId = req.params.id;
    const game = await Games.findOne({ id: gameId }).maxTimeMS(30000);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ game });
  } catch (error) {
    console.error("Error fetching game details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
