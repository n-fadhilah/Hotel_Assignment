const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
const dbConfig = require("./app/config/db.config.js");

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const client = new MongoClient(dbConfig.url, options);

client.connect((err) => {
  if (err) {
    console.log("Cannot connect to the database!", err);
    process.exit();
  }
  console.log("Connected to database!");
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to API Server" });
});

require("./app/routes/hotel.routes")(app, client);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
