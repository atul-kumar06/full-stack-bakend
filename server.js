const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const connectdb = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/ProductRoute");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRoutes = require("./routes/orderRoute");
const uploadRoutes = require("./routes/uploadRoutes");
const subscriberRoutes = require("./routes/subscriberRoute");
const adminRoutes = require("./routes/adminRoutes");
const productAdminroute = require("./routes/productAdminroute");
const adminOrderRoutes = require("./routes/adminOrderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to database
connectdb();

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", subscriberRoutes);

// Admin
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productAdminroute);
app.use("/api/admin/orders", adminOrderRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
