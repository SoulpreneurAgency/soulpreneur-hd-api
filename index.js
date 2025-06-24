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

// Privacy policy endpoint for ChatGPT Actions
app.get('/privacy', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Privacy Policy - Human Design API</title>
    </head>
    <body>
        <h1>Privacy Policy</h1>
        <p>This API processes birth data to generate Human Design charts for personal insights.</p>
        <p>We do not store, share, or retain any personal information provided.</p>
        <p>All data is processed temporarily and discarded immediately after chart generation.</p>
        <p>For questions, contact: support@soulpreneur.com</p>
    </body>
    </html>
  `);
});

// Main endpoint for Human Design data
app.post('/get-hd-data', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    
    const { first_name, last_name, email, birth_date, birth_time, birth_location } = req.body;
    
    if (!first_name || !last_name || !email || !birth_date || !birth_time || !birth_location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: first_name, last_name, email, birth_date, birth_time, birth_location'
      });
    }

    const dateTime = `${birth_date} ${birth_time}`;
    
    console.log('Making request to BodyGraph API with:', {
      api_key: process.env.API_KEY ? 'SET' : 'NOT SET',
      date: dateTime,
      timezone: 'Europe/London'
    });

    const response = await axios.get('https://api.bodygraphchart.com/v221006/hd-data', {
      params: {
        api_key: process.env.API_KEY,
        date: dateTime,
        timezone: 'Europe/London'
      },
      timeout: 30000
    });

    console.log('BodyGraph API response received');
    console.log('Response status:', response.status);

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
      res.status(error.response.status).json({
        success: false,
        error: 'BodyGraph API error',
        details: error.response.data,
        status: error.response.status
      });
    } else if (error.request) {
      res.status(500).json({
        success: false,
        error: 'No response from BodyGraph API',
        details: error.message
      });
    } else {
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
  console.log(`Privacy policy: http://localhost:${PORT}/privacy`);
  console.log(`Main endpoint: http://localhost:${PORT}/get-hd-data`);
});

module.exports = app;
