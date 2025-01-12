import axios from "axios";
import fs from "fs";

const SearchGeoGuesser = async (req, res) => {
  const { file } = req;

  console.log(`File received: ${file}`);

  try {
    if (!file) {
      return res.status(400).json({ message: "No file provided." });
    }

    // Process the image and detect location
    const detectionResponse = await detectWebWithApiKey(`./${file.path}`);
    res.status(200).json({
      message: "Location retrieved successfully",
      streetViewUrl: detectionResponse.streetViewUrl,
      mapsUrl: detectionResponse.mapsUrl,
      latitude: detectionResponse.lat,
      location : detectionResponse.searchQuery,
      longitude: detectionResponse.lng,
      filePath: file,
    });
  } catch (error) {
    console.error("Error during processing:", error);
    res.status(500).json({ message: error.message || "Error during processing." });
  }
};

async function detectWebWithApiKey(imagePath) {
  try {
    // Read the image file and convert it to base64
    const imageFile = fs.readFileSync(imagePath);
    const imageBase64 = imageFile.toString("base64");
    console.log("Image converted to Base64.");

    // Define the Vision API endpoint and request body
    const visionEndpoint = `https://vision.googleapis.com/v1/images:annotate?key=${"AIzaSyCITJsGKWFtOhyCmurW0ZmftmMTxHvPVz0"}`;
    const requestBody = {
      requests: [
        {
          image: { content: imageBase64 },
          features: [
            { type: "LABEL_DETECTION", maxResults: 10 },
            { type: "WEB_DETECTION", maxResults: 5 },
            { type: "LANDMARK_DETECTION", maxResults: 5 },
          ],
        },
      ],
    };

    // Call the Vision API
    const visionResponse = await axios.post(visionEndpoint, requestBody);

    if (
      !visionResponse.data ||
      !visionResponse.data.responses ||
      visionResponse.data.responses.length === 0
    ) {
      throw new Error("No response from Vision API.");
    }

    const result = visionResponse.data.responses[0];
    let searchQuery;
    let lat, lng;

    // 1. Check for landmark detection (most reliable)
    if (result.landmarkAnnotations && result.landmarkAnnotations.length > 0) {
      const landmark = result.landmarkAnnotations[0];
      console.log(`Landmark detected: ${landmark.description}`);
      searchQuery = landmark.description;

      if (landmark.locations && landmark.locations.length > 0) {
        lat = landmark.locations[0].latLng.latitude;
        lng = landmark.locations[0].latLng.longitude;
        console.log(`Landmark coordinates: Latitude ${lat}, Longitude ${lng}`);
      }
    }

    // 2. Check for web detection if no landmark found
    if (!searchQuery && result.webDetection && result.webDetection.webEntities) {
      const webEntity = result.webDetection.webEntities.find(
        (entity) => entity.description && entity.score > 0.5
      );
      if (webEntity) {
        console.log(`Web entity detected: ${webEntity.description}`);
        searchQuery = webEntity.description;
      }
    }

    // 3. Check for labels if no web detection found
    if (!searchQuery && result.labelAnnotations && result.labelAnnotations.length > 0) {
      console.log(`Top label detected: ${result.labelAnnotations[0].description}`);
      searchQuery = result.labelAnnotations[0].description;
    }

    if (!searchQuery) {
      throw new Error("No significant detection found in the image.");
    }

    // Use Geocoding API to get precise coordinates
    if (!lat || !lng) {
      const geocodeEndpoint = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        searchQuery
      )}&key=${"AIzaSyCITJsGKWFtOhyCmurW0ZmftmMTxHvPVz0"}`;
      const geocodeResponse = await axios.get(geocodeEndpoint);

      if (
        geocodeResponse.data.results &&
        geocodeResponse.data.results.length > 0
      ) {
        const location = geocodeResponse.data.results[0].geometry.location;
        lat = location.lat;
        lng = location.lng;
        console.log(`Geocoded coordinates: Latitude ${lat}, Longitude ${lng}`);
      } else {
        throw new Error("Failed to geocode the detected location.");
      }
    }

    // Generate URLs
    const streetViewUrl = `${lat},${lng}`;
    const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(searchQuery)}`;

    return { mapsUrl, streetViewUrl, lat, lng, searchQuery };
  } catch (error) {
    console.error("Error in detectWebWithApiKey:", error.message || error.response?.data);
    throw error;
  }
}

export { SearchGeoGuesser };
