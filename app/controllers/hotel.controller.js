const axios = require("axios");
const apiConfig = require("../config/api.config.js");
const apiUrls = apiConfig.apiUrls;
const db = require("../models");
const Hotel = db.hotel;
const NodeCache = require("node-cache");
const cache = new NodeCache();

exports.getHotels = async (req, res, client) => {
  try {
    getHotelsFromSuppliers(client);
    const { destinationid, hotelid } = req.query;
    let query = {};

    if (hotelid) {
      query.hotelId = { $regex: new RegExp(hotelid, "i") };
    }

    const cacheKey = JSON.stringify(req.query);

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const hotelsData = await Hotel.find(query).lean();
    cache.set(cacheKey, hotelsData);
    res.json(hotelsData);
  } catch (error) {
    console.error("An error occurred while fetching hotel data:", error);
    res.status(500).json({ error: "Failed to fetch hotel data" });
  }
};

async function getHotelsFromSuppliers(client) {
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
    "image",
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
    name,
    Name,
    hotel_name,
    ...hotelInfo
  } = hotel;

  propertiesToDelete.forEach((property) => {
    delete hotelInfo[property];
  });

  const hotelName = name || Name || hotel_name;
  const hotelDescription = Description || details || info;

  return { hotelName, hotelInfo, hotelDescription };
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
