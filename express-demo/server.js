const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require("path");
const fs = require("fs");
const flush=require("connect-flash");
const server = express();
const expressLayouts = require("express-ejs-layouts");
const { uploadOnCloudinary } = require("./utils/cloudinaryConfig");
const { upload } = require("./middleware/multerConfig");
const ensureAuthenticated = require('./middleware/authMiddleware');


// MongoDB connection
mongoose.connect("mongodb+srv://hammadyousuf87:hammad123@cluster0.utgeoal.mongodb.net/")
  .then(() => {
    console.log("DB CONNECTED");
    server.listen(3000, () => {
      console.log("Server started at http://localhost:3000");
    });
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
  });

// Middleware
server.use(express.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
server.use(express.static("public"));
server.use('/cars/css', express.static('public/css'));
server.set("view engine", "ejs");
server.use(expressLayouts);
server.set("views", path.join(__dirname, "views"));

// User and Car models
const User = require('./models/User');
const Car = require('./models/Car');


// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    res.redirect('/'); // Redirect to homepage if user is already authenticated
  } else {
    next(); // Continue to the next middleware or route handler
  }
};

// Routes
server.get("/signup", isAuthenticated, (req, res) => {
  res.render("signup");
});

server.get("/login", isAuthenticated, (req, res) => {
  res.render("login");
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

server.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = user; // Storing the full user object in session
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.redirect('/login');
  }
});

server.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Apply ensureAuthenticated middleware to the contact-us route
server.get("/contact-us", (req, res) => {
  const showMessage = !req.session.user;
  res.render("contact-us", { showMessage: showMessage });

});

server.get("/cars/:page?", async (req, res) => {
  try {
    let page = req.params.page || 1;
    let pageSize = 4; // Adjusted to display 4 records per page
    let skip = pageSize * (page - 1);
    let cars = await Car.find().skip(skip).limit(pageSize);
    let total = await Car.countDocuments();
    let totalPages = Math.ceil(total / pageSize);

    let isAdmin = req.session.user && (req.session?.user.role == "admin");

    console.log("Admin:", isAdmin)

    res.render("carList", { 
      pageTitle: "List All Cars",
      cars,
      total,
      page,
      pageSize,
      totalPages,
      isAdmin
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).send("Internal Server Error");
  }
});

server.get("/form", (req, res) => {
  res.render("form");
});

server.post("/form", async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.redirect("/cars");
  } catch (error) {
    console.log(error);
  }
});

server.get("/homepage", (req, res) => {
  res.render("homepage");
}); 

server.get("/", (req, res) => {
  res.render("homepage");
});

server.get("/ajaxapi", (req, res) => {
  res.render("ajaxapi");
});

const carRoutes = require('./routes/api/cars'); // Assuming your car routes are defined in this file
server.use('/cars', carRoutes);

server.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const localfilepath = req.file.path;
  try {
    const imageUrl = await uploadOnCloudinary(localfilepath);
    if (imageUrl) {
      // Redirect back to the car list page after successful upload
      return res.redirect("/carList");
    } else {
      return res.status(500).json({ error: "Failed to upload image to Cloudinary" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (fs.existsSync(localfilepath)) {
      fs.unlinkSync(localfilepath);
    }
  }
});

const { ObjectId } = require('mongoose').Types; 

server.get('/cars/details/:id', async (req, res) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send('Invalid ID');
  }

  try {
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).send('Car not found');
    }
    res.render('carDetails', { car });
  } catch (error) {
    console.error("Error fetching car details:", error);
    res.status(500).send("Internal Server Error");
  }
});
