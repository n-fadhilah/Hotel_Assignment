module.exports = (app) => {
  const hotels = require("../controllers/hotel.controller.js");

  var router = require("express").Router();

  router.get("/", hotels.getallhotels);

  app.use("/api/hotels", router);
};
