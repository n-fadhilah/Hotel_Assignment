const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  hotelId: {
    type: String,
    required: false,
  },
  destinationId: {
    type: Number,
    required: false,
  },
  name: String,
  location: String,
  rating: Number,
  description: String,
  rooms: [
    {
      roomType: String,
      price: Number,
    },
  ],
  amenities: [
    {
      name: String,
    },
  ],
  images: [
    {
      url: String,
      caption: String,
    },
  ],
});

const Hotel = mongoose.model("Hotel", hotelSchema);

module.exports = Hotel;
