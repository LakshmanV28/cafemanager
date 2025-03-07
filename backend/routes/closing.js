const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Recipe = require("../models/Reciepe");
const Inventory = require("../models/Inventory");

// Fetch all orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching orders" });
  }
});

// Process closing - Update inventory based on orders
router.post("/process-closing", async (req, res) => {
  try {
    const orders = await Order.find();
    let inventory = await Inventory.find();

    for (const order of orders) {
      for (const item of order.items) {
        const recipe = await Recipe.findOne({ productName: item.name });

        if (recipe) {
          for (const ingredient of recipe.ingredients) {
            const inventoryItem = inventory.find((inv) => inv.name === ingredient.name);
            if (inventoryItem) {
              inventoryItem.quantity -= ingredient.quantityToBeUsed * item.quantity;
              await inventoryItem.save();
            }
          }
        }
      }
    }

    res.json({ message: "Inventory updated based on orders" });
  } catch (error) {
    res.status(500).json({ error: "Error processing closing" });
  }
});

module.exports = router;
