const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, "public")));

// Route for homepage
app.get("/", (req, res) => {
  res.render("index", {
    title: "Welcome to My EJS App",
    message: "Hello, World!",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
