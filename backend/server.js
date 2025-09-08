const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = "your_secret_key"; // Use env var in real app

app.use(cors());
app.use(express.json());

// Serve static frontend from ../public (adjust path)
app.use(express.static(path.join(__dirname, "..", "public")));

// Setup SQLite DB with users, products, orders tables
const db = new sqlite3.Database("./ecommerce.db", (err) => {
  if (err) console.error("DB ERR:", err.message);
  else console.log("Connected to SQLite DB");
});

// Create tables
db.serialize(() => {
  // Users
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT UNIQUE
  )`);

  // Products
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    price REAL,
    description TEXT,
    image TEXT
  )`);

  // Orders
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // OrderItems (many-to-many for orders and products)
  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);
});

// Import products from JSON if needed
const productsFile = path.join(__dirname, "products.json");
const fs = require("fs");
try {
  const productsData = JSON.parse(fs.readFileSync(productsFile));
  productsData.forEach((p) => {
    // Insert or ignore if id exists
    db.run(
      `INSERT OR IGNORE INTO products (id, name, price, description, image) VALUES (?, ?, ?, ?, ?)`,
      [p.id, p.name, p.price, p.description, p.image]
    );
  });
} catch (err) {
  console.error("Could not import products:", err);
}

// Helper: authenticate token middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ message: "Token missing" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// User registration
app.post("/api/users/register", (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email)
    return res.status(400).json({ message: "All fields required" });

  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: "Server error" });

    // Insert user
    db.run(
      `INSERT INTO users (username, password, email) VALUES (?, ?, ?)`,
      [username, hashedPassword, email],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(400).json({ message: "Username or email taken" });
          }
          return res.status(500).json({ message: "Database error" });
        }
        res.json({ id: this.lastID, username, email });
      }
    );
  });
});

// User login
app.post("/api/users/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });

  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) return res.status(500).json({ message: "Server error" });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    bcrypt.compare(password, user.password, (err, result) => {
      if (err || !result)
        return res.status(400).json({ message: "Invalid credentials" });

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      res.json({ token, username: user.username });
    });
  });
});

// Get all products
app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(rows);
  });
});

// Get single product by id
app.get("/api/products/:id", (req, res) => {
  db.get("SELECT * FROM products WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (!row) return res.status(404).json({ message: "Product not found" });
    res.json(row);
  });
});

// Place order (requires auth)
app.post("/api/order", authenticateToken, (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ message: "No items in order" });

  // Insert into orders table
  db.run(
    `INSERT INTO orders (user_id) VALUES (?)`,
    [req.user.id],
    function (err) {
      if (err) return res.status(500).json({ message: "DB error" });

      const orderId = this.lastID;

      // Insert each order item
      const stmt = db.prepare(
        `INSERT INTO order_items (order_id, product_id, quantity) VALUES (?, ?, ?)`
      );

      for (const item of items) {
        stmt.run(orderId, item.id, item.quantity);
      }
      stmt.finalize();

      res.json({ message: "Order placed successfully", orderId });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
