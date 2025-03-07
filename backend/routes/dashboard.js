const express = require("express");
const router = express.Router();
const Purchase = require("../models/Cart");

// Dashboard Route - Get top selling products, quantity sold, and total earnings
router.get("/", async (req, res) => {
  try {
    const purchases = await Purchase.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: { name: "$items.name", category: "$items.category" },
          totalQuantitySold: { $sum: "$items.quantity" },
          totalSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { 
        $sort: { totalQuantitySold: -1 } 
      }
    ]);

    const totalEarnings = purchases.reduce((acc, item) => acc + item.totalSales, 0);

    res.json({
      topSellingProducts: purchases.map(item => ({
        name: item._id.name,
        category: item._id.category,
        totalQuantitySold: item.totalQuantitySold,
        totalSales: item.totalSales,
      })),
      totalEarnings,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
