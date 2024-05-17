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
  car.images = req.body.images;

  await car.save();
  res.send(car);
});

router.get("/api/cars/:id", async function (req, res) {
  let car = await Car.findById(req.params.id);
  if (!car) return res.status(404).send("Record Not Found");
  res.send(car);
});

router.get("/cars/:page?", async (req, res) => {
  let page = Number(req.params.page) ? Number(req.params.page) : 1;
  let pageSize = 3;
  let cars = await Car.find()
    .skip(pageSize * (page - 1))
    .limit(pageSize);
  let total = await Car.countDocuments();
  let totalPages = Math.ceil(total / pageSize);
  res.render("list", {
    pageTitle: "List All Cars",
    cars:cars,
    total:total,
    page,
    pageSize,
    totalPages,
  });
});

module.exports = router;
