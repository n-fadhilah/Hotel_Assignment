const axios = require("axios");
const apiConfig = require("../config/api.config.js");
const apiUrls = apiConfig.apiUrls;

exports.getallhotels = async (req, res, client) => {
  try {
    const allHotels = [];
    const apiRequests = apiUrls.map((url) => axios.get(url));
    const responses = await Promise.all(apiRequests);

    const allhotelCollection = client.db().collection("allHotels");

    for (let index = 0; index < responses.length; index++) {
      const response = responses[index];
      allHotels.push(...response.data);
      const supplierName = `supplier_${index + 1}`;
      const supplierCollection = client.db().collection(supplierName);

      await saveHotelstoDb(response, supplierCollection, allhotelCollection);
    }

    const hotelsData = await allhotelCollection.find().toArray();
    res.json(hotelsData);
  } catch (error) {
    console.error("An error occurred while fetching hotel data:", error);
    res.status(500).json({ error: "Failed to fetch hotel data" });
    return error;
  }
};

async function saveHotelstoDb(
  response,
  supplierCollection,
  allhotelCollection
) {
  const updatePromises = response.data.map(async (document) => {
    const {
      hotel_id: hotelId,
      Id,
      id,
      DestinationId,
      destination_id,
      destination,
      ...cleanDocument
    } = document;

    const query = {
      hotelId: hotelId || Id || id,
      destinationId: DestinationId || destination_id || destination,
    };
    const update = { $set: cleanDocument };
    const options = { upsert: true };
    delete document._id;

    const supplierUpdatePromise = supplierCollection.updateOne(
      query,
      update,
      options
    );
    const allHotelUpdatePromise = allhotelCollection.updateOne(
      query,
      update,
      options
    );

    return Promise.all([supplierUpdatePromise, allHotelUpdatePromise]);
  });

  await Promise.all(updatePromises);
}
