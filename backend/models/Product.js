const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  // _id: { type: String, required: true }, // Using String for consistency
  name: { type: String, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const CategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  products: [ProductSchema]
},
{ collection: "Products" });

module.exports = mongoose.model("Product", CategorySchema);
