const axios = require("axios");
const apiConfig = require("../config/api.config.js");
const apiUrls = apiConfig.apiUrls;

exports.getHotels = (req, res, client) => {
  Hotel.find(req.query)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Failed to fetch hotel data",
      });
    });
};

async function getAllHotels(client) {
  try {
    const apiRequests = apiUrls.map((url) => axios.get(url));
    const responses = await Promise.all(apiRequests);

    const allhotelCollection = client.db().collection("hotels");

    await Promise.all(
      responses.map((response) => saveHotelstoDb(response, allhotelCollection))
    );

    const hotelsData = await allhotelCollection.find().toArray();
    return hotelsData;
  } catch (error) {
    console.error("An error occurred while fetching hotel data:", error);
    throw new Error("Failed to fetch hotel data");
  }
}

async function saveHotelstoDb(response, allhotelCollection) {
  const updatePromises = response.data.map(async (hotel) => {
    const hotelInfo = extractHotelInfo(hotel);
    const query = createQuery(hotel);
    const update = createUpdate(hotelInfo);
    const options = { upsert: true };

    return allhotelCollection.updateOne(query, update, options);
  });

  await Promise.all(updatePromises);
}

function extractHotelInfo(hotel) {
  const propertiesToDelete = [
    "address",
    "Address",
    "postalcode",
    "Longitude",
    "Latitude",
    "amenities",
    "Description",
    "info",
    "details",
    "hotel_name",
    "name",
  ];

  const {
    hotel_id: hotelId,
    Id,
    id,
    DestinationId,
    destination_id,
    destination,
    Description,
    info,
    details,
    ...hotelInfo
  } = hotel;

  propertiesToDelete.forEach((property) => {
    delete hotelInfo[property];
  });

  const hotelDescription = Description || info || details;

  return { hotelInfo, hotelDescription };
}

function createQuery(hotel) {
  const {
    hotel_id: hotelId,
    Id,
    id,
    DestinationId,
    destination_id,
    destination,
  } = hotel;

  return {
    hotelId: hotelId || Id || id,
    destinationId: DestinationId || destination_id || destination,
  };
}

function createUpdate(hotelInfo) {
  const standardizedHotel = Object.keys(hotelInfo).reduce((result, key) => {
    result[key.toLowerCase()] = hotelInfo[key];
    return result;
  }, {});

  const update = {
    $set: { ...standardizedHotel },
  };

  Object.keys(update.$set).forEach((key) => {
    if (update.$set[key] === null) {
      delete update.$set[key];
    }
  });

  return update;
}
