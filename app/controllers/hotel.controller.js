const axios = require("axios");
const apiConfig = require("../config/api.config.js");
const apiUrls = apiConfig.apiUrls;

exports.getallhotels = async (req, res, client) => {
  try {
    const allHotels = [];
    const apiRequests = apiUrls.map((url) => axios.get(url));
    const responses = await Promise.all(apiRequests);
    const allhotelCollection = client.db().collection("allHotels");

    responses.forEach(async (response, index) => {
      allHotels.push(...response.data);
      const supplierName = `supplier_${index + 1}`;
      saveHotelstoDb(response, supplierName, allhotelCollection);
      console.log(`Inserted/updated hotel data in collection ${supplierName}`);
    });

    res.json(allHotels);
  } catch (error) {
    console.error("An error occurred while fetching hotel data:", error);
    res.status(500).json({ error: "Failed to fetch hotel data" });
    return error;
  }
};

function saveHotelstoDb(response, supplierName, allhotelCollection) {
  const supplierCollection = client.db().collection(supplierName);

  response.data.forEach(async (document) => {
    const query = {
      hotelId: document.hotel_id ?? document.Id ?? document.id,
      destinationId:
        document.DestinationId ??
        document.destination_id ??
        document.destination,
    };
    const update = { $set: document };
    const options = { upsert: true };
    delete document._id;
    await supplierCollection.updateOne(query, update, options);
    await allhotelCollection.updateOne(query, update, options);
  });
}
