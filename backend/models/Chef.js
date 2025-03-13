// models/Product.js
const mongoose = require("mongoose");

// models/Order.js
const OrderSchema = new mongoose.Schema({
    tableNo: { type: String, required: true },
    items: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        comment: { type: String, default: "" },
        status: {type:String}
      }
    ],  
    orderTime: { type: Date, default: Date.now }
  },
  { collection: "Chef" });
  
  module.exports = mongoose.model("Order", OrderSchema);
