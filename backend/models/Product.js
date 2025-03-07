const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Using String for consistency
  name: { type: String, required: true },
  price: { type: Number, required: true }
});

const CategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  products: [ProductSchema] // Array of products within each category
},
{ collection: "Products" });

module.exports = mongoose.model("Product", CategorySchema);
