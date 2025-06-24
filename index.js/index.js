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
    
    // Validate required fields
    const { first_name, last_name, email, birth_date, birth_time, birth_location } = req.body;
    
    if (!first_name || !last_name || !email || !birth_date || !birth_time || !birth_location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: first_name, last_name, email, birth_date, birth_time, birth_location'
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
        timezone: 'Europe/London' // Default timezone - you might want to detect this from birth_location
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('BodyGraph API response received');
    console.log('Response status:', response.status);
    console.log('Response data keys:', Object.keys(response.data));

    // Return the response from BodyGraph API
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
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    if (error.response) {
      // BodyGraph API responded with error
      res.status(error.response.status).json({
        success: false,
        error: 'BodyGraph API error',
        details: error.response.data,
        status: error.response.status
      });
    } else if (error.request) {
      // No response received
      res.status(500).json({
        success: false,
        error: 'No response from BodyGraph API',
        details: error.message
      });
    } else {
      // Other error
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Main endpoint: http://localhost:${PORT}/get-hd-data`);
});

module.exports = app;