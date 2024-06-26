// routes/api/cars.js
const express = require("express");
const router = express.Router();
const Car = require("../../models/Car");
// Search route
router.get("/search/:page?", async (req, res) => {
  try {
    const query = req.query.query || "";
    const page = Number(req.params.page) || 1;
    const pageSize = 4; // Adjust the page size as needed
    const skip = pageSize * (page - 1);

    // Save search term to session
    if (!req.session.searchHistory) {
      req.session.searchHistory = [];
    }
    if (query && !req.session.searchHistory.includes(query)) {
      req.session.searchHistory.push(query);
    }

    const searchCriteria = {
      $or: [
        { make: { $regex: query, $options: "i" } },
        { model: { $regex: query, $options: "i" } },
        // Add other fields as needed
      ],
    };

    const cars = await Car.find(searchCriteria).skip(skip).limit(pageSize);
    const total = await Car.countDocuments(searchCriteria);
    const totalPages = Math.ceil(total / pageSize);

    res.render("searchResults", {
      pageTitle: "Search Results",
      cars,
      total,
      page,
      pageSize,
      totalPages,
      query,
      searchHistory: req.session.searchHistory,
    });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/api/cars", async (req, res) => {
  try {
    let car = new Car(req.body);
    await car.save();
    res.send(car);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});


router.delete("/:id", async (req, res) => {
  try {
    let car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).send("Car not found");
    }
    res.redirect('/cars');
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/:id/delete", async (req, res) => {
  try {
    let car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).send("Car not found");
    }
    await car.deleteOne(); // Perform the deletion
    res.redirect('/cars');
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/:id/edit', async (req, res) => {
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


router.post('/:id/edit', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).send('Car not found');
    }

    // Update car fields
    car.make = req.body.make;
    car.model = req.body.model;
    car.year = req.body.year;
    car.price = req.body.price;
    car.description = req.body.description;
    car.color = req.body.color;

    // Update car images
    car.images = req.body.images.map(image => ({
      url: image.url,
      description: image.description
    }));

    // Save the updated car
    const updatedCar = await car.save();

    res.redirect('/cars');
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
    let pageSize = 4; // Adjusted to display 4 records per page
    console.log("Page:", page);
    console.log("Page Size:", pageSize);
    let skip = pageSize * (page - 1);
    console.log("Skip:", skip);
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