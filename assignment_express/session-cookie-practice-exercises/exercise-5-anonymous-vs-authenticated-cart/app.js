const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "cart-secret",
    resave: false,
    saveUninitialized: true
  })
);

function getGuestCart(req) {
  const rawCart = req.cookies.guestCart;

  if (!rawCart) {
    return [];
  }

  try {
    return JSON.parse(rawCart);
  } catch (error) {
    return [];
  }
}

app.get("/", (req, res) => {
  const guestCart = getGuestCart(req);
  const userCart = req.session.cart || [];
  const visibleCart = req.session.user ? userCart : guestCart;

  res.send(`
    <h2>Cart Demo</h2>
    <p>User: ${req.session.user ? req.session.user.username : "Guest"}</p>
    <p>Cart: ${visibleCart.join(", ") || "Empty"}</p>
    <form method="post" action="/add-item">
      <input name="item" placeholder="Product name" />
      <button type="submit">Add item</button>
    </form>
    <form method="post" action="/login">
      <button type="submit">Login</button>
    </form>
  `);
});

app.post("/add-item", (req, res) => {
  const item = req.body.item;

  if (req.session.user) {
    req.session.cart = req.session.cart || [];
    req.session.cart.push(item);
  } else {
    const guestCart = getGuestCart(req);
    guestCart.push(item);
    res.cookie("guestCart", JSON.stringify(guestCart), {
      maxAge: 24 * 60 * 60 * 1000
    });
  }

  res.redirect("/");
});

app.post("/login", (req, res) => {
  req.session.user = { username: "demo-user" };
  req.session.cart = req.session.cart || [];

  const guestCart = getGuestCart(req);
  req.session.cart = req.session.cart.concat(guestCart);
  res.clearCookie("guestCart");

  res.redirect("/");
});

app.listen(4004, () => {
  console.log("Exercise 5 running on http://localhost:4004");
});
