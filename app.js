const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const _port = Number(process.env.PORT);
const PORT = isNaN(_port) ? 3000 : _port;

//  Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

//  MySQL connection pool
const pool = mysql.createPool(dbConfig);

async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(20),
        name VARCHAR(255),
        message TEXT
      )
    `);
    console.log("✅ Table 'messages' is ready");
  } catch (err) {
    console.error("❌ Database init error:", err);
  }
}
initDatabase();

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Route for homepage
app.get("/", (req, res) => {
  res.render("index", { success: req.query.success == "1" });
});

app.post("/messages", async (req, res) => {
  try {
    const { name, phone, message } = req.body;

    // 1. Basic Server-Side Validation
    if (!name || name.trim().length < 3) {
      return res.status(400).send("نام باید حداقل ۳ کاراکتر باشد.");
    }

    // Simple Regex for phone (basic format)
    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).send("فرمت شماره تماس صحیح نیست.");
    }

    if (!message || message.trim().length < 5) {
      return res.status(400).send("پیام باید حداقل ۵ کاراکتر باشد.");
    }

    // 2. Save to Database
    await pool.query(
      "INSERT INTO messages (name, phone, message) VALUES (?, ?, ?)",
      [name, phone, message]
    );

    // 3. Redirect with success flag
    res.redirect("/?success=1");
  } catch (err) {
    console.error(err);
    res.status(500).send("خطایی در سرور رخ داد. لطفا دوباره تلاش کنید.");
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
