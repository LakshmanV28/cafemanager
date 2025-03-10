const express = require("express");
const router = express.Router();
const Chef = require("../models/Chef"); 
const Product = require("../models/Product"); 
const Purchase = require("../models/Cart"); 
const Category = require("../models/Product")


router.get("/orders", async (req, res) => {
    try {
        const orders = await Chef.find();

        // Fetch categories to get product prices
        const categories = await Category.find();

        // Map orders and attach price from CategorySchema
        const ordersWithPrice = orders.map(order => {
            const updatedItems = order.items.map(item => {
                let itemPrice = 0;

                // Search for the product in categories
                categories.forEach(category => {
                    const foundProduct = category.products.find(p => p.name === item.name);
                    if (foundProduct) {
                        itemPrice = foundProduct.price;
                    }
                });

                return {
                    ...item._doc,
                    price: itemPrice, // Attach price to item
                };
            });

            return {
                ...order._doc,
                items: updatedItems,
            };
        });

        res.json(ordersWithPrice);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Checkout individual item
router.post("/checkout", async (req, res) => {
  try {
    const { orderId, item, modeOfPayment } = req.body;

    if (!orderId || !item || !modeOfPayment) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the product details
    const product = await Product.findOne({ name: item.name });
    if (!product) {
      return res.status(400).json({ error: `Product not found: ${item.name}` });
    }

    const itemTotal = item.qty * product.price;

    // Save to Purchases collection
    const newPurchase = new Purchase({
      items: [
        {
          name: item.name,
          category: product.category || "Uncategorized",
          price: product.price,
          quantity: item.qty,
        },
      ],
      total: itemTotal,
      modeOfPayment,
    });

    await newPurchase.save();

    // ✅ Remove item from the Chef order
    await Chef.findByIdAndUpdate(orderId, { $pull: { items: { name: item.name } } });

    // ✅ If the order is empty after removing the item, delete the order
    const updatedOrder = await Chef.findById(orderId);
    if (updatedOrder.items.length === 0) {
      await Chef.findByIdAndDelete(orderId);
    }

    res.json({ message: "Checkout successful", purchase: newPurchase });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/orders/:orderId", async (req, res) => {
    try {
        await Chef.findByIdAndDelete(req.params.orderId);
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete order" });
    }
});


module.exports = router;
