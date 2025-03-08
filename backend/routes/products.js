const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { v4: uuidv4 } = require("uuid"); // Generate unique IDs

// ✅ Route: Get all products (Make sure this exists)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// ✅ Add New Product API
router.post("/add", async (req, res) => {
  try {
    const { name, price, category } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newProduct = {
      _id: uuidv4(), // Generate unique _id
      name,
      price,
    };

    // ✅ Check if the category already exists
    let categoryDoc = await Product.findOne({ category });

    if (categoryDoc) {
      // ✅ If category exists, add product to it
      categoryDoc.products.push(newProduct);
      await categoryDoc.save();
    } else {
      // ✅ If category doesn't exist, create a new one
      categoryDoc = new Product({
        category,
        products: [newProduct],
      });
      await categoryDoc.save();
    }

    res.status(201).json({ message: "Product added successfully", product: newProduct });

  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Delete Product API
router.delete("/delete", async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Product name and category are required" });
    }

    // ✅ Find the category
    let categoryDoc = await Product.findOne({ category });

    if (!categoryDoc) {
      return res.status(404).json({ message: "Category not found" });
    }

    // ✅ Filter out the product to be deleted
    const updatedProducts = categoryDoc.products.filter(product => product.name !== name);

    // ✅ If no products left, delete the entire category
    if (updatedProducts.length === 0) {
      await Product.deleteOne({ category });
      return res.status(200).json({ message: "Product removed and category deleted" });
    }

    // ✅ Otherwise, update the category with remaining products
    categoryDoc.products = updatedProducts;
    await categoryDoc.save();

    res.status(200).json({ message: "Product deleted successfully" });

  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
