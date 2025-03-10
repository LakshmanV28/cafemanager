const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  items: [
    {
      name: { type: String, required: true },
      category: { type: String, required: true }, 
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    }                                                                     
  ],                                                                                  
  total: { type: Number, required: true },
  modeOfPayment: { type: String, required: true },
  purchaseDate: { type: Date, default: Date.now }
},
{ collection: "Purchases" });

module.exports = mongoose.model("Cart", CartSchema);
