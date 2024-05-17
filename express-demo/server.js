const express = require("express");
const mongo = require("./dbconnect");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

const server = express();
server.use(express.json());
server.set("view engine", "ejs");
server.use(express.static("public"));
var expressLayouts = require("express-ejs-layouts");
server.use(expressLayouts);
server.use('/cars/css', express.static('public/css'));




// MongoDB connection
// mongo();

// User model
const User = require('./models/User');
const Car = require('./models/Car');


// Middleware
server.use(bodyParser.urlencoded({ extended: true }));
server.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

// Routes
// Routes for Car Management
const carRoutes = require('./routes/api/cars'); // Assuming your car routes are defined in this file
server.use('/cars', carRoutes);

// Auth Routes
server.get("/cars", async (req, res) => {
  try {
    const cars = await Car.find();
    const pageTitle = "List of Cars";
    const page = 1;
    const total = cars.length;
    const pageSize = 3; // Set your desired page size here
    const totalPages = Math.ceil(total / pageSize); // Calculate total pages
    res.render("carList", { pageTitle, cars, page, total, totalPages });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).send("Internal Server Error");
  }
});
server.get("/cars/new", (req, res) => {
  res.render("form", { pageTitle: "Add New Car" });
});

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

mongoose.connect("mongodb+srv://hammadyousuf87:hammad123@cluster0.utgeoal.mongodb.net/").then((data)=>{
  console.log("DB CONNECTED");
});

server.listen(3000, () => {
  console.log("Server started at localhost:3000");
});
