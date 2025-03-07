const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderNumber: String,
  customerName: String,
  items: [{ name: String, price: Number, quantity: Number }],
  totalAmount: Number,
  paymentStatus: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
  orderType: { type: String, enum: ["dine-in", "takeaway", "online"] },
  createdAt: { type: Date, default: Date.now }
},
{ collection: "Orders" });

module.exports = mongoose.model("Order", OrderSchema);
