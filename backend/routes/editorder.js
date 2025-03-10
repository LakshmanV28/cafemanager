const express = require("express");
const router = express.Router();
const Order = require("../models/Chef");
const Category = require("../models/Product");

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
});


// ✅ Get a specific order by ID
router.get("/:orderId", async (req, res) => {
    try {
      const order = await Order.findById(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Error fetching order", error });
    }
  });
  
// Add an item to an order
router.post("/add-item/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { name, qty, comment } = req.body;

  try {
    let order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.items.push({ name, qty, comment });
    await order.save();
    res.json({ message: "Item added successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error adding item", error });
  }
});

// Update an item in an order
router.put("/update-item/:orderId/:itemId", async (req, res) => {
  const { orderId, itemId } = req.params;
  const { qty, comment } = req.body;

  try {
    let order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    let item = order.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.qty = qty;
    item.comment = comment;
    await order.save();
    res.json({ message: "Item updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating item", error });
  }
});

// Delete an item from an order
router.delete("/delete-item/:orderId/:itemId", async (req, res) => {
  const { orderId, itemId } = req.params;

  try {
    let order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.items = order.items.filter((item) => item._id.toString() !== itemId);
    await order.save();
    res.json({ message: "Item deleted successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item", error });
  }
});

// Checkout an order
router.post("/checkout/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { modeOfPayment } = req.body;

  try {
    let order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    let total = 0;
    let checkoutItems = [];

    for (let item of order.items) {
      const categoryDoc = await Category.findOne({ "products.name": item.name });
      if (!categoryDoc) return res.status(400).json({ message: `Category not found for ${item.name}` });

      const product = categoryDoc.products.find((p) => p.name === item.name);
      if (!product) return res.status(400).json({ message: `Price not found for ${item.name}` });

      checkoutItems.push({
        name: item.name,
        category: categoryDoc.category,
        price: product.price,
        quantity: item.qty,
      });

      total += product.price * item.qty;
    }

    const checkoutData = {
      items: checkoutItems,
      total,
      modeOfPayment,
      purchaseDate: new Date(),
    };

    const response = await fetch("https://cashman-node.onrender.com/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutData),
    });

    if (!response.ok) {
      throw new Error("Error processing checkout");
    }

    res.json({ message: "Checkout successful", checkoutData });
  } catch (error) {
    res.status(500).json({ message: "Error during checkout", error });
  }
});

module.exports = router;
