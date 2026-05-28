const mongoose = require("mongoose");
const { subscribe } = require("../routes/userRoutes");

const subscribeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

const Subscriber = mongoose.model("Subscriber", subscribeSchema);

module.exports = Subscriber;
