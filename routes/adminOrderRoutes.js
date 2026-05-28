const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const Order = require("../models/Order");

// @route GET /api/admin/orders
// @desc Get all order (Admin only)
// @access Private/Admin

router.get("/", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email");
    res.json(orders);
  } catch (error) {
    // CHANGE THIS: Log the actual error object
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
// @route PUT /api/admin/orders/ : id
// @desc Update order status
// @access Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const orders = await Order.findById(req.params.id);
    if (orders) {
      orders.status = req.body.status || orders.status;
      orders.isDelivered =
        req.body.status === "Delivered" ? true : orders.isDelivered;
      orders.deliveredAt =
        req.body.status === "Delivered" ? Date.now() : orders.deliveredAt;
      const updatedOrder = await orders.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @route DELETE /api/admin/orders/ : id
// @desc Delete an order
// @access Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: "Order deleted successfully" });
    }
  } catch (error) {
    console.error("DEBUG ERROR:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
module.exports = router;
