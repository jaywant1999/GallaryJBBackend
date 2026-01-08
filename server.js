const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { json } = require("body-parser");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;

const app = express();

app.use(cors());
app.use(json());

const { parsed: config } = dotenv.config();
cloudinary.config({
  cloud_name: config.CLOUD_NAME,
  api_key: config.API_KEY,
  api_secret: config.API_SECRET,
});
const BASE_URL = `https://api.cloudinary.com/v1_1/${config.CLOUD_NAME}/resources/search`;
const auth = {
  username: config.API_KEY,
  password: config.API_SECRET,
};

app.get("/gallery", async (req, res) => {
  try {
    const response = await axios.get(BASE_URL, {
      auth,
      params: {
        expression: "folder:GalleryJB",
        max_results: 500, 
      },
    });
    return res.send(response.data);
  }
  catch (error) {
    console.error("Error fetching images:", error.message);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

app.delete("/gallery/:public_id", async (req, res) => {
  try {
    const public_id = decodeURIComponent(req.params.public_id);

     
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result !== "ok") {
      return res.status(400).json({ error: "Failed to delete image" });
    }

    res.json({ message: "Image deleted successfully", result });
  } catch (error) {
    console.error("Error deleting image:", error.message);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

const port = process.env.PORT;
app.listen(port, console.log(`server is running on port ${port}......`));