const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectdb = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/ProductRoute");
const cartRoutes = require("./routes/cartRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to database
connectdb();

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
