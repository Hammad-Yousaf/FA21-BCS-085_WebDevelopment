const express = require("express");
let router = express.Router();
let Car = require("../../models/Car");

router.post("/api/cars", async function (req, res) {
  let data = req.body;
  let car = new Car(data);
  await car.save();
  res.send(car);
});


router.delete("/api/cars/:id", async function (req, res) {
  let car = await Car.findByIdAndDelete(req.params.id);
  if (!car) return res.status(404).send("Record Not Found");
  res.send(car);
});

router.put("/api/cars/:id", async function (req, res) {
  let car = await Car.findById(req.params.id);
  if (!car) return res.status(404).send("Record Not Found");

  car.make = req.body.make;
  car.model = req.body.model;
  car.year = req.body.year;
  car.price = req.body.price;
  car.description = req.body.description;
  car.color = req.body.color;
  // car.images = req.body.images;

  await car.save();
  res.send(car);
});

router.get("/api/cars/:id", async function (req, res) {
  let car = await Car.findById(req.params.id);
  if (!car) return res.status(404).send("Record Not Found");
  res.send(car);
});

module.exports = router;
