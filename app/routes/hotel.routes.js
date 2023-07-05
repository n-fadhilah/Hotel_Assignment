module.exports = (app, client) => {
  const hotels = require("../controllers/hotel.controller.js");

  var router = require("express").Router();

  router.get("/", (req, res) => {
    hotels.getallhotels(req, res, client);
  });

  app.use("/api/hotels", router);
};
