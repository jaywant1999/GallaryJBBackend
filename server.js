const express = require("express");
const cors = require("cors");
const { json } = require("body-parser");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;

const app = express();

app.use(
  cors({
    origin: ["https://gallary-jb-frontend.vercel.app","http://localhost:2608"],
    methods: ["GET", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(json());

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

console.log("CLOUD_NAME:", process.env.CLOUD_NAME);
console.log("API_KEY:", process.env.API_KEY ? "SET" : "NOT SET");

const BASE_URL = `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/resources/search`;
const auth = {
  username: process.env.API_KEY,
  password: process.env.API_SECRET,
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
  if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
    return res.status(400).json({ error: "Check environment variables" });
  }

  try {
    const public_id = decodeURIComponent(req.params.public_id);


    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result !== "ok") {
      return res.status(400).json({ error: "Failed to delete image" });
    }

    res.json({ message: "Image deleted successfully", result });
  } catch (error) {
    console.error("Error deleting image:", error.message);
    if (error.response) {
      console.error("Cloudinary API response:", error.response.status, error.response.data);
    }
    res.status(500).json({ error: "Failed to delete image" });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, console.log(`server is running on port ${PORT}......`));