const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/get-hd-data", async (req, res) => {
  const { first_name, last_name, email, birth_date, birth_time, birth_location } = req.body;

  try {
    const response = await axios.post(
      "https://api.bodygraphchart.com/v221006/hd-data",
      {
        birthDate: birth_date,
        birthTime: birth_time,
        birthPlace: birth_location
      },
      {
        headers: {
        "x-api-key": "852ba816-8a29-483c-939a-0c9fecc82e2a",
          "Content-Type": "application/json"
        }
      }
    );

    const chartData = response.data;

    res.json({
      success: true,
      user: { first_name, last_name, email },
      chart: chartData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch chart data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
