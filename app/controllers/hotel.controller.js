const axios = require("axios");
const apiConfig = require("../config/api.config.js");
const apiUrls = apiConfig.apiUrls;

exports.getallhotels = async (req, res) => {
  try {
    const aggregatedResults = [];
    const apiRequests = apiUrls.map((url) => axios.get(url));
    const responses = await Promise.all(apiRequests);

    responses.forEach((response) => {
      aggregatedResults.push(...response.data);
    });

    res.json(aggregatedResults);
  } catch (error) {
    console.error("An error occurred while fetching hotel data:", error);
    res.status(500).json({ error: "Failed to fetch hotel data" });
    return error;
  }
};
