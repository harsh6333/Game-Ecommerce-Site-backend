import express from "express";
// import body from 'express-validators'
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
      "Your Password should have atleasst 5 characters"
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
    // console.log(UserData.id);
    const data = {
      user: {
        id: UserData.id,
      },
    };

    const authToken = jwt.sign(data, process.env.JWT_SECRET);
    console.log(authToken);
    return res.json({ success: true, authToken: authToken });
    // console.log(authToken);
  } catch (error) {
    console.error("Error creating user:", error);
    res.json({
      success: false,
    });
  }
});
const verifyToken = (req, res, next) => {
  const authToken = req.header("Authorization");
  // console.log(authToken);
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
// Create a new route to get user data
router.get("/get-user", verifyToken, async (req, res) => {
  try {
    // Get the user ID from the verified token
    const userId = req.userId;

    // Find the user by their ID
    const user = await User.findById(userId).maxTimeMS(30000);
    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }

    // Return the user's username and email
    res.json({ username: user.Username, email: user.email });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ errors: "Server error." });
  }
});

router.post("/add-to-cart", verifyToken, async (req, res) => {
  try {
    const { num, name, image, price } = req.body;

    // Find the user by their ID
    const user = await User.findById(req.userId).maxTimeMS(30000);

    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }

    // Create an object representing the item to add to the cart
    const cartItem = {
      num,
      name,
      image,
      price: 99, // You can customize the price as needed
    };

    // Add the cartItem to the user's cart array
    user.cart.push(cartItem);

    // Save the updated user document
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
    // Get the user ID from the verified token
    const userId = req.userId;
    // console.log(userId);

    // Find the user by their ID
    const user = await User.findById(userId).maxTimeMS(30000);

    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }

    // Return the user's cart items
    res.json({ cartItems: user.cart });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ errors: "Server error." });
  }
});

router.post("/remove-from-cart", verifyToken, async (req, res) => {
  try {
    const { itemId } = req.body;

    // Find the user by their ID
    const user = await User.findById(req.userId).maxTimeMS(30000);

    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }

    // Remove the item with the specified itemId from the user's cart
    user.cart = user.cart
      .filter((item) => item._id.toString() !== itemId)
      .maxTimeMS(30000);

    // Save the updated user document
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
    // Retrieve the game data from the Game model
    const games = await Games.find().maxTimeMS(30000);

    // Send the game data as a JSON response
    res.json({ games });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/get-user-cart", verifyToken, async (req, res) => {
  try {
    // Get the user ID from the verified token
    const userId = req.userId;

    // Find the user by their ID
    const user = await User.findById(userId).maxTimeMS(30000);

    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }

    // Log user and user's cart for debugging purposes
    // console.log("User:", user);
    // console.log("User's Cart:", user.cart);

    // Return the user's cart data
    res.json({ userCart: user.cart });
  } catch (error) {
    console.error("Error fetching user's cart data:", error);
    res.status(500).json({ errors: "Server error." });
  }
});
router.get("/:id", async (req, res) => {
  try {
    // Parse the gameId parameter as a number
    const gameId = parseInt(req.params.id);

    if (isNaN(gameId)) {
      return res.status(400).json({ error: "Invalid game ID" });
    }

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
