const express = require("express");
const Cart = require("../models/Cart");
const router = express.Router();
const twilio = require("twilio");
require("dotenv").config();

// Twilio Credentials (Store in .env file)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = new twilio(accountSid, authToken);

// Sample Route for Checkout
// router.post("/checkout", async (req, res) => {
//   console.log(req.body);
  
//   const { items, total, modeOfPayment, purchaseDate, phoneNumber } = req.body; // Get user phone number
//   try {
//     // Generate Order Summary
//     let orderSummary = "🛒 Your Order Receipt:\n";
//     items.forEach((item, index) => {
//       orderSummary += `${index + 1}. ${item.name} (${item.category}) - ${item.quantity} x ₹${item.price.toFixed(2)}\n`;
//     });
//     orderSummary += `Total: ₹${total.toFixed(2)}\nPayment: ${modeOfPayment}\nDate: ${new Date(purchaseDate).toLocaleString()}`;

//     // Send SMS
//     await twilioClient.messages.create({
//       body: orderSummary,
//       from: process.env.TWILIO_PHONE_NUMBER, // Twilio Number
//       to: phoneNumber, // Customer's Phone Number
//     });

//     res.status(200).json({ message: "Order placed & SMS sent successfully!" });
//   } catch (error) {
//     console.error("Error sending SMS:", error);
//     res.status(500).json({ message: "Error processing order" });
//   }
// });

// 📌 Route to save cart data
router.post("/add", async (req, res) => {
  try {
    const { items, total, modeOfPayment } = req.body;

    const newCart = new Cart({
      items,
      total,
      modeOfPayment
    });

    await newCart.save();
    res.status(201).json({ message: "Cart saved successfully!" });
  } catch (error) {
    console.error("Error saving cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 Route to get all cart data
router.get("/", async (req, res) => {
  try {
    const carts = await Cart.find().sort({ purchaseDate: -1 });
    res.status(200).json(carts);
  } catch (error) {
    console.error("Error fetching cart data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
