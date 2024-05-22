const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require("path");
const fs = require("fs");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");
const { uploadOnCloudinary } = require("./utils/cloudinaryConfig");
const { upload } = require("./middleware/multerConfig");

const app = express();

// MongoDB connection
mongoose.connect("mongodb+srv://hammadyousuf87:hammad123@cluster0.utgeoal.mongodb.net/")
  .then(() => {
    console.log("DB CONNECTED");
    app.listen(3000, () => {
      console.log("Server started at http://localhost:3000");
    });
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
  });

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(express.static("public"));
app.use('/cars/css', express.static('public/css'));
app.use(flash());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
};
app.use((req, res, next) => {
  if (req.session.user) {
    console.log(req.session.user);
    res.locals.loggedIn = true;
    console.log(res.locals.loggedIn)
  } else {
    res.locals.loggedIn = false;
  }
  next();
});
// Routes
const orderRoutes = require('./routes/api/orders');
const carRoutes = require('./routes/api/cars');
app.use('/orders', orderRoutes);
app.use('/cars', carRoutes);

// User and Car models
const User = require('./models/User');
const Car = require('./models/Car');

// Authentication middleware
const isUnauthenticated = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  next();
};

// Routes

// app.get("/", (req, res) => {
//   res.render("home");
// });

app.get("/signup", isUnauthenticated, (req, res) => {
  res.render("signup");
});

app.get("/login", isUnauthenticated, (req, res) => {
  res.render("login");
});

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    console.error("Error during signup:", error);
    res.redirect('/signup');
  }
});

app.post("/login", async (req, res) => {
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

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get("/contact-us", (req, res) => {
  const showMessage = !req.session.user;
  res.render("contact-us", { showMessage });
});


app.get("/cars/:page?", async (req, res) => {
  try {
    const page = req.params.page || 1;
    const pageSize = 4;
    const skip = pageSize * (page - 1);
    const cars = await Car.find().skip(skip).limit(pageSize);
    const total = await Car.countDocuments();
    const totalPages = Math.ceil(total / pageSize);

    const isAdmin = req.session.user && req.session.user.role === "admin";

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

app.get("/form", isAuthenticated, (req, res) => {
  res.render("form");
});

app.post("/form", isAuthenticated, async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.redirect("/cars");
  } catch (error) {
    console.error("Error saving car:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/homepage", (req, res) => {
  res.render("homepage");
});

app.get("/", (req, res) => {
  res.render("homepage");
});

app.get("/ajaxapi", (req, res) => {
  res.render("ajaxapi");
});

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const localFilePath = req.file.path;
  try {
    const imageUrl = await uploadOnCloudinary(localFilePath);
    if (imageUrl) {
      return res.redirect("/cars");
    } else {
      return res.status(500).json({ error: "Failed to upload image to Cloudinary" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
});

const { ObjectId } = require('mongoose').Types;

app.get('/cars/details/:id', async (req, res) => {
  const preferredPriceUnit = req.query.preferredPriceUnit || req.cookies.preferredPriceUnit || "USD";

  if (preferredPriceUnit === "PKR") {
    res.cookie('preferredPriceUnit', preferredPriceUnit, { maxAge: 900000, httpOnly: true });
  }

  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send('Invalid ID');
  }

  try {
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).send('Car not found');
    }

    if (preferredPriceUnit === "PKR") {
      car.price = car.price * 170;
    }

    res.render('carDetails', { car, preferredPriceUnit, isAuthenticated: req.session.user ? true : false });
  } catch (error) {
    console.error("Error fetching car details:", error);
    res.status(500).send("Internal Server Error");
  }
}); 