const express = require("express");
const router = express.Router();
const Purchase = require("../models/Cart");

// GET orders grouped by purchase date
router.get("/", async (req, res) => {
  try {
    const orders = await Purchase.find().sort({ purchaseDate: -1 });

    // Ensure we got an array before calling reduce
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.json({ message: "No orders found", orders: [] });
    }


    // Group orders by purchaseDate
    const groupedOrders = orders.reduce((acc, order) => {
      if (!order.purchaseDate) return acc; // Skip if purchaseDate is missing
      const date = new Date(order.purchaseDate).toISOString().split("T")[0]; // Format: YYYY-MM-DD
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(order);
      return acc;
    }, {});

    res.json(groupedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
