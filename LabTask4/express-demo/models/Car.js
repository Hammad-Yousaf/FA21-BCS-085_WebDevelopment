
const mongoose = require("mongoose");

let carSchema = mongoose.Schema({
  make: String,
  model: String,
  year: Number,
  price: Number,
  description: String,
  color: String,
  images: [
    {
      url: String,
      description: String
    }
  ]
});

let Car = mongoose.model("Car", carSchema);
module.exports = Car;
