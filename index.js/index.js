const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// CORS configuration to allow requests from your domain
app.use(cors({
  origin: 'https://soulpreneur-hd-api.onrender.com'
}));

// Port configuration
const PORT = process.env.PORT || 3000;

// API endpoint to get human design data
app.post('/get-hd-data', async (req, res) => {
  try {
    const { first_name, last_name, email, birth_date, birth_time, birth_location } = req.body;

    // Validate required fields
    if (!birth_date || !birth_time || !birth_location) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Make request to external API
    const response = await axios.post(
      "https://api.bodygraphchart.com/v221096/hd-data",
      {
        birthDate: birth_date,
        birthTime: birth_time,
        birthPlace: birth_location
      },
      {
        headers: {
          "X-API-Key": process.env.API_KEY,
          "Content-Type": "application/json",
          "Origin": "https://soulpreneur-hd-api.onrender.com"
        }
      }
    );

    const chartData = response.data;

    // Return success response
    res.json({
      success: true,
      user: { first_name, last_name, email },
      chart: chartData
    });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error || 'Invalid API key or server error'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});