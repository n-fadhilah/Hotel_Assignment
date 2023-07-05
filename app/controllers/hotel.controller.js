const axios = require("axios");
const apiConfig = require("../config/api.config.js");
const apiUrls = apiConfig.apiUrls;

exports.getallhotels = async (req, res, client) => {
  try {
    const aggregatedResults = [];
    const apiRequests = apiUrls.map((url) => axios.get(url));
    const responses = await Promise.all(apiRequests);

    responses.forEach(async (response, index) => {
      aggregatedResults.push(...response.data);
      const collectionName = `supplier_${index + 1}`;
      const collection = client.db().collection(collectionName);

      const result = await collection.insertMany(response.data);
      console.log(
        `Inserted ${result.insertedCount} hotel(s) into collection ${collectionName}`
      );
    });

    const collection1 = client.db().collection("allHotels");
    await collection1.insertMany(aggregatedResults);

    res.json(aggregatedResults);
  } catch (error) {
    console.error("An error occurred while fetching hotel data:", error);
    res.status(500).json({ error: "Failed to fetch hotel data" });
    return error;
  }
};
