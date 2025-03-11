const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "captain", "chef"], default: "chef" }
},
{ collection: "Users" });

module.exports = mongoose.model("Users", UserSchema);
