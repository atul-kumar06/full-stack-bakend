const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Helper function to get a cart
const getCart = async (userId, guestId) => {
  if (userId) {
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guestId });
  }
  return null;
};

// @route POST /api/cart
router.post("/", async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await getCart(userId, guestId);

    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) =>
          p.productId &&
          p.productId.toString() === productId &&
          p.size === size &&
          p.color === color,
      );

      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({
          productId: productId,
          name: product.name,
          image: product.images[0].url,
          price: product.price,
          size,
          color,
          quantity,
        });
      }

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      const newCart = await Cart.create({
        user: userId || undefined,
        guestId: guestId || "guest_" + new Date().getTime(),
        products: [
          {
            productId: productId,
            name: product.name,
            image: product.images[0].url,
            price: product.price,
            size,
            color,
            quantity,
          },
        ],
        totalPrice: product.price * quantity,
      });
      return res.status(201).json(newCart);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @route PUT/api/cart
// @desc Update product quantity in the cart for a guest or logged-in user
// @access Public

router.put("/", async (req, res) => {
  // 1. Corrected variable name from userID to userId to match the body
  const { productId, quantity, size, color, guestId, userId } = req.body;

  try {
    // 2. Pass the correct variable here
    let cart = await getCart(userId, guestId);

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // 3. Simplified and fixed the index finding logic
    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId &&
        p.productId.toString() === productId.toString() &&
        p.size === size &&
        p.color === color,
    );

    if (productIndex > -1) {
      if (quantity > 0) {
        cart.products[productIndex].quantity = quantity;
      } else {
        cart.products.splice(productIndex, 1);
      }

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );

      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
});

// @route DELETE /api/cart
// @desc Remove a product from the cart
router.delete("/", async (req, res) => {
  const { productId, size, color, guestId, userId } = req.body;

  try {
    let cart = await getCart(userId, guestId);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Find the index of the product to remove
    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId &&
        p.productId.toString() === productId.toString() &&
        p.size === size &&
        p.color === color,
    );

    if (productIndex > -1) {
      // Remove the product from the array
      cart.products.splice(productIndex, 1);

      // Recalculate total price
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );

      // If cart is empty, you might want to delete the cart document itself
      if (cart.products.length === 0) {
        await Cart.findByIdAndDelete(cart._id);
        return res.status(200).json({ message: "Cart cleared" });
      }

      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
});

// @route POST /api/cart/merge
// @desc Merge guest cart into user cart on login
// @access Private
router.post("/merge", protect, async (req, res) => {
  const { guestId } = req.body;

  try {
    // 1. Fetch carts
    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: req.user._id });

    // 2. Validate guest cart
    if (!guestCart || guestCart.products.length === 0) {
      return res.status(400).json({ message: "No guest cart to merge" });
    }

    // 3. Scenario: User already has a cart, merge into it
    if (userCart) {
      guestCart.products.forEach((guestItem) => {
        // Skip malformed guest items
        if (!guestItem.productId) return;

        // Find index using Mongoose .equals() for safety
        const productIndex = userCart.products.findIndex(
          (item) =>
            item.productId &&
            item.productId.equals(guestItem.productId) &&
            item.size === guestItem.size &&
            item.color === guestItem.color,
        );

        if (productIndex > -1) {
          // Update quantity if item exists
          userCart.products[productIndex].quantity += guestItem.quantity;
        } else {
          // Add new item if it doesn't exist
          userCart.products.push(guestItem);
        }
      });

      // Recalculate total price
      userCart.totalPrice = userCart.products.reduce(
        (acc, item) => acc + (item.price || 0) * item.quantity,
        0,
      );

      await userCart.save();
      await Cart.findOneAndDelete({ guestId }); // Remove the now-empty guest cart
      return res.status(200).json(userCart);
    } else {
      // 4. Scenario: User has no cart, take ownership of the guest cart
      guestCart.user = req.user._id;
      guestCart.guestId = undefined; // Clear guest identifier
      await guestCart.save();
      return res.status(200).json(guestCart);
    }
  } catch (error) {
    console.error("Merge Error:", error);
    res.status(500).json({ message: "Server Error during merge" });
  }
});
module.exports = router;
