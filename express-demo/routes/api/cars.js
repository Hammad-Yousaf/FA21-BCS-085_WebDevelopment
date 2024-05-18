// routes/api/cars.js
const express = require("express");
const router = express.Router();
const Car = require("../../models/Car");

router.post("/api/cars", async (req, res) => {
  try {
    let car = new Car(req.body);
    await car.save();
    res.send(car);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// router.delete("/api/cars/:id", async (req, res) => {
//   try {
//     let car = await Car.findByIdAndDelete(req.params.id);
//     if (!car) return res.status(404).send("Record Not Found");
//     res.send(car);
//   } catch (error) {
//     res.status(500).send("Internal Server Error");
//   }
// });

router.delete('/api/cars/:id/delete', async (req, res) => {
  try {
      await Car.findByIdAndDelete(req.params.id);
      res.redirect('/carList'); // Redirect to the car list page after deletion
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});
// router.put("/api/cars/:id", async (req, res) => {
//   try {
//     let car = await Car.findById(req.params.id);
//     if (!car) return res.status(404).send("Record Not Found");

//     Object.assign(car, req.body);
//     await car.save();
//     res.send(car);
//   } catch (error) {
//     res.status(500).send("Internal Server Error");
//   }
// });
router.get('/cars/:id/edit', async (req, res) => {
  try {
      const car = await Car.findById(req.params.id);
      if (!car) {
          return res.status(404).send('Car not found');
      }
      res.render('editCar', { car: car });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});
router.get("/api/cars/:id", async (req, res) => {
  try {
    let car = await Car.findById(req.params.id);
    if (!car) return res.status(404).send("Record Not Found");
    res.send(car);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.get("/cars/:page?", async (req, res) => {
  try {
    let page = Number(req.params.page) || 1;
    let pageSize = 3;
    let cars = await Car.find().skip(pageSize * (page - 1)).limit(pageSize);
    let total = await Car.countDocuments();
    let totalPages = Math.ceil(total / pageSize);

    res.render("list", {
      pageTitle: "List All Cars",
      cars,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

router.post('/new', async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.redirect('/cars');
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
