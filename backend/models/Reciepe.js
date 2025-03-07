const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    ingredients: [
        {
            name: { type: String, required: true },
            quantityToBeUsed: { type: Number, required: true },
            unit: { type: String, required: true }
        }
    ]
},
{ collection: "Reciepe" });

module.exports = mongoose.model("Recipe", RecipeSchema);
