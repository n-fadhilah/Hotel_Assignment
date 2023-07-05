const axios = require("axios");
const apiConfig = require("../config/api.config.js");
const apiUrls = apiConfig.apiUrls;

exports.getallhotels = async (req, res, client) => {
  try {
    const allHotels = [];
    const apiRequests = apiUrls.map((url) => axios.get(url));
    const responses = await Promise.all(apiRequests);

    responses.forEach(async (response, index) => {
      aggregatedResults.push(...response.data);
      const supplierName = `supplier_${index + 1}`;
      const supplierCollection = client.db().collection(supplierName);

      const result = await supplierCollection.insertMany(response.data);
      console.log(
        `Inserted ${result.insertedCount} hotel(s) into collection ${supplierName}`
      );
    });

    const allhotelCollection = client.db().collection("allHotels");
    await allhotelCollection.insertMany(allHotels);

    res.json(allHotels);
  } catch (error) {
    console.error("An error occurred while fetching hotel data:", error);
    res.status(500).json({ error: "Failed to fetch hotel data" });
    return error;
  }
};
