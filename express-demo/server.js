const express = require("express");

let server = express();
server.use(express.json());
server.set("view engine", "ejs");
server.use(express.static("public"));
var expressLayouts = require("express-ejs-layouts");
server.use(expressLayouts);


const workoutRoutes = require('./routes/cars')

// express app
const app = express()

// middleware
app.use(express.json())

app.use((req, res, next) => {
  console.log(req.path, req.method)
  next()
})

// routes
app.use('/api/cars', workoutRoutes)


server.get("/homepage.html", (req, res) => {
  res.render("homepage");
}); 

server.get("/contact-us.html", (req, res) => {
  res.render("contact-us");
});

server.get("/ajaxapi.html", (req, res) => {
    res.render("ajaxapi");
  });
server.get("/", (req, res) => {
  res.render("homepage");
});





server.listen(3000, () => {
  console.log("Server started at localhost:3000");
});