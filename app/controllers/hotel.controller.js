const axios = require("axios");
const apiConfig = require("../config/api.config.js");
const apiUrls = apiConfig.apiUrls;

exports.getallhotels = async (req, res, client) => {
  try {
    const apiRequests = apiUrls.map((url) => axios.get(url));
    const responses = await Promise.all(apiRequests);

    const allhotelCollection = client.db().collection("hotels");

    await Promise.all(
      responses.map((response) => saveHotelstoDb(response, allhotelCollection))
    );

    const hotelsData = await allhotelCollection.find().toArray();
    res.json(hotelsData);
  } catch (error) {
    console.error("An error occurred while fetching hotel data:", error);
    res.status(500).json({ error: "Failed to fetch hotel data" });
    return error;
  }
};

async function saveHotelstoDb(response, allhotelCollection) {
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

  const updatePromises = response.data.map(async (hotel) => {
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

    const hotelDescription = Description || info || details;

    const query = {
      hotelId: hotelId || Id || id,
      destinationId: DestinationId || destination_id || destination,
    };

    propertiesToDelete.forEach((property) => {
      delete hotelInfo[property];
    });

    const standardizedDocument = Object.keys(hotelInfo).reduce(
      (result, key) => {
        result[key.toLowerCase()] = hotelInfo[key];
        return result;
      },
      {}
    );

    const update = {
      $set: { ...standardizedDocument, hotelDescription },
    };

    Object.keys(update.$set).forEach((key) => {
      if (update.$set[key] === null) {
        delete update.$set[key];
      }
    });

    const options = { upsert: true };
    delete document._id;

    const allHotelUpdatePromise = allhotelCollection.updateOne(
      query,
      update,
      options
    );

    return allHotelUpdatePromise;
  });

  await Promise.all(updatePromises);
}
