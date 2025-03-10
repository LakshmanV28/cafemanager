// routes/chefRoutes.js
const express = require("express");
const router = express.Router();
const Chef = require("../models/Chef");

// Place an order
router.post("/add", async (req, res) => {
    try {
      const { tableNo, items } = req.body;
      if (!tableNo || !items || items.length === 0) {
        return res.status(400).json({ error: "Table number and items are required" });
      }
      const newOrder = new Chef({ tableNo, items });
      await newOrder.save();
      res.status(201).json({ message: "Order placed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Get all orders from the chef collection
router.get("/", async (req, res) => {
    try {
      const orders = await Chef.find(); // Fetch all orders
      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  module.exports = router;