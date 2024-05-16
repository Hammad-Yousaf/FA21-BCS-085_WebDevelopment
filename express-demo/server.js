const express = require("express");
const mongo = require("./dbconnect");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

const server = express();
server.use(express.json());
server.set("view engine", "ejs");
server.use(express.static("public"));
var expressLayouts = require("express-ejs-layouts");
server.use(expressLayouts);

// MongoDB connection
mongo();

// User model
const User = require('./models/User');

// Middleware
server.use(bodyParser.urlencoded({ extended: true }));
server.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

// Routes
const workoutRoutes = require('./routes/api/cars');
server.use('/api/cars', workoutRoutes);

// Auth Routes
server.get("/signup", (req, res) => {
  res.render("signup");
});

server.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    res.redirect('/signup');
  }
});

server.get("/login", (req, res) => {
  res.render("login");
});

server.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.userId = user._id;
    res.redirect('/');
  } else {
    res.redirect('/login');
  }
});

server.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Existing routes
server.get("/homepage", (req, res) => {
  res.render("homepage");
}); 

server.get("/contact-us", (req, res) => {
  res.render("contact-us");
});

server.get("/ajaxapi", (req, res) => {
  res.render("ajaxapi");
});

server.get("/form", (req, res) => {
  res.render("form");
});

server.post("/form", async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

server.get("/", (req, res) => {
  res.render("homepage");
});

server.listen(3000, () => {
  console.log("Server started at localhost:3000");
});
