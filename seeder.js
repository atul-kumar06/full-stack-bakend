const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const User = require("./models/Users");
const Cart = require("./models/Cart");
const products = require("./data/products");

// connect to data base
mongoose.connect(process.env.MONGO_URI);

// Function to seed data

const seedData = async function () {
  try {
    // Clear existing data
    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();
    // Create a default admin user
    const createdUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "123456",
      role: "admin",
    });
    //Assign the default user ID to each product
    const userID = createdUser._id;
    const sampleProducts = products.map((product) => {
      return { ...product, user: userID };
    });
    // Insert the products into the database
    await Product.insertMany(sampleProducts);
    console.log("Product Data seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding the data", error);
    process.exit(1);
  }
};
seedData();
