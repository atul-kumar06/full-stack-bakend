const mongoose = require("mongoose");

async function conncectDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Data base connected successfully");
  } catch (error) {
    console.error("MongoDb connection failed.", error);
    process.exit(1);
  }
}

module.exports = conncectDb;
