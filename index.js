const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint for health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Human Design API Server is running',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Main endpoint for Human Design data
app.post('/get-hd-data', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    
    const { first_name, last_name, email, birth_date, birth_time, birth_location } = req.body;
    
    if (!first_name || !last_name || !email || !birth_date || !birth_time || !birth_location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const dateTime = `${birth_date} ${birth_time}`;
    
    const response = await axios.get('https://api.bodygraphchart.com/v221006/hd-data', {
      params: {
        api_key: process.env.API_KEY,
        date: dateTime,
        timezone: 'Europe/London'
      },
      timeout: 30000
    });

    res.json({
      success: true,
      data: response.data,
      user_info: {
        first_name,
        last_name,
        email,
        birth_date,
        birth_time,
        birth_location
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'API error',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
