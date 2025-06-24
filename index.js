const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/get-hd-data', async (req, res) => {
  try {
    const { first_name, last_name, email, birth_date, birth_time, birth_location } = req.body;
    
    // Validate required fields
    if (!first_name || !last_name || !email || !birth_date || !birth_time || !birth_location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Format the date and time for BodyGraph API (YYYY-MM-DD HH:MM)
    const dateTime = `${birth_date} ${birth_time}`;
    
    console.log('Making request to BodyGraph API with:', {
      api_key: process.env.API_KEY ? 'SET' : 'NOT SET',
      date: dateTime,
      timezone: 'Europe/London'
    });
    
    // Make GET request to BodyGraph API with URL parameters
    const response = await axios.get('https://api.bodygraphchart.com/v221006/hd-data', {
      params: {
        api_key: process.env.API_KEY,
        date: dateTime,
        timezone: 'Europe/London' // Default timezone - you might want to determine this from birth_location
      }
    });

    console.log('BodyGraph API response received');

    res.json({
      success: true,
      data: response.data,
      user_info: { 
        first_name, 
        last_name, 
        email, 
        birth_location,
        birth_date,
        birth_time
      }
    });

  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
