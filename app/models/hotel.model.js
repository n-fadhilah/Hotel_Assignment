module.exports = (mongoose) => {
  const hotelSchema = new mongoose.Schema({
    destinationId: {
      type: Number,
      required: true,
    },
    hotelId: {
      type: String,
      required: true,
    },
    hoteldescription: {
      type: String,
    },
    hotelname: {
      type: String,
    },
    hotelinfo: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
      images: {
        rooms: [
          {
            url: {
              type: String,
            },
            description: {
              type: String,
            },
          },
        ],
        amenities: [
          {
            url: {
              type: String,
            },
            description: {
              type: String,
            },
          },
        ],
      },
      location: {
        address: {
          type: String,
        },
        country: {
          type: String,
        },
      },
      facilities: [
        {
          type: String,
        },
      ],
      booking_conditions: [
        {
          type: String,
        },
      ],
    },
  });

  const Hotel = mongoose.model("hotel", hotelSchema);

  return Hotel;
};
