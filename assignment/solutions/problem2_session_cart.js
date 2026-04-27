const express = require("express");
const session = require("express-session");

const app = express();
app.use(express.json());
app.use(
  session({
    secret: "cart-secret",
    resave: false,
    saveUninitialized: false,
  }),
);

const productCatalog = [
  { id: "p101", name: "Wireless Mouse", price: 799 },
  { id: "p102", name: "Mechanical Keyboard", price: 2499 },
  { id: "p103", name: "USB-C Hub", price: 1499 },
];

const initCart = (req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }

  next();
};

function buildCartSummary(cart) {
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return {
    items: cart,
    totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice,
  };
}

app.use(initCart);

app.post("/cart/add", (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = productCatalog.find((entry) => entry.id === productId);

  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  if (quantity <= 0) {
    return res.status(400).json({ error: "Quantity must be greater than zero." });
  }

  const existingItem = req.session.cart.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    req.session.cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
  }

  return res.status(201).json({
    message: "Item added to cart.",
    cart: buildCartSummary(req.session.cart),
  });
});

app.put("/cart/update/:productId", (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const cartItem = req.session.cart.find((item) => item.productId === productId);

  if (!cartItem) {
    return res.status(404).json({ error: "Cart item not found." });
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ error: "Quantity must be a non-negative integer." });
  }

  if (quantity === 0) {
    req.session.cart = req.session.cart.filter((item) => item.productId !== productId);
    return res.json({
      message: "Item removed because quantity was set to zero.",
      cart: buildCartSummary(req.session.cart),
    });
  }

  cartItem.quantity = quantity;

  return res.json({
    message: "Cart item updated.",
    cart: buildCartSummary(req.session.cart),
  });
});

app.delete("/cart/remove/:productId", (req, res) => {
  const { productId } = req.params;
  const itemExists = req.session.cart.some((item) => item.productId === productId);

  if (!itemExists) {
    return res.status(404).json({ error: "Cart item not found." });
  }

  req.session.cart = req.session.cart.filter((item) => item.productId !== productId);

  return res.json({
    message: "Item removed from cart.",
    cart: buildCartSummary(req.session.cart),
  });
});

app.delete("/cart/clear", (req, res) => {
  req.session.cart = [];

  return res.json({
    message: "Cart cleared.",
    cart: buildCartSummary(req.session.cart),
  });
});

app.get("/cart", (req, res) => {
  res.json(buildCartSummary(req.session.cart));
});

app.listen(3000, () => {
  console.log("Problem 2 server is running on port 3000");
});
