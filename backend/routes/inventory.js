const express = require("express");
const router = express.Router();
const Inventory = require("../models/Inventory");

// Fetch all inventory items
router.get("/", async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: "Error fetching inventory" });
  }
});

// Add new ingredient
router.post("/add", async (req, res) => {
  const { name, quantity, unit, price } = req.body;

  try {
    const newIngredient = new Inventory({ name, quantity, unit, price });
    await newIngredient.save();
    res.status(201).json({ message: "Ingredient added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error adding ingredient" });
  }
});

// Update an ingredient
router.put("/update/:id", async (req, res) => {
  const { quantity, price } = req.body;

  try {
    await Inventory.findByIdAndUpdate(req.params.id, { quantity, price });
    res.json({ message: "Ingredient updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error updating ingredient" });
  }
});

// Delete an ingredient
router.delete("/delete/:id", async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Ingredient deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting ingredient" });
  }
});

module.exports = router;
