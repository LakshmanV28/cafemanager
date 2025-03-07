const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  price: { type: Number, required: true },
},
{ collection: "Inventory" }
);

InventorySchema.virtual("totalCost").get(function () {
  return this.quantity * this.price;
});

const Inventory = mongoose.model("Inventory", InventorySchema);
module.exports = Inventory;
