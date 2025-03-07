const mongoose = require("mongoose");

const closingSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    ingredientsUsed: [
        {
            name: { type: String, required: true },
            quantityUsed: { type: Number, required: true },
            unit: { type: String, required: true }
        }
    ],
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Closing", closingSchema);
