// Load environment variables based on environment
require('dotenv').config({ 
  path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local'
});
const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const fsSync = require('fs');  // For createReadStream
const path = require('path');
const os = require('os');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Input validation middleware
const validateFileUrl = (req, res, next) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: 'fileUrl is required' });
  }
  try {
    new URL(fileUrl); // Validate URL format
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid fileUrl format' });
  }
};

// Validate API configuration middleware
const validateApiConfig = (req, res, next) => {
  const { UNSTRUCTURED_API_URL, UNSTRUCTURED_API_KEY } = process.env;
  if (!UNSTRUCTURED_API_URL || !UNSTRUCTURED_API_KEY) {
    return res.status(500).json({ error: 'API configuration is missing' });
  }
  next();
};

app.post('/process-file', validateFileUrl, validateApiConfig, async (req, res) => {
  const { fileUrl } = req.body;
  let tempFilePath;

  try {
    // Download the file
    const response = await axios.get(fileUrl, { 
      responseType: 'arraybuffer',
      timeout: 5000, // 5 second timeout
      maxContentLength: 10 * 1024 * 1024 // 10MB max file size
    });

    // Create temp file with unique name
    const url = new URL(fileUrl);
    const originalFileName = path.basename(url.pathname.split('/').pop().split('?')[0]);
    const fileName = `${Date.now()}-${originalFileName}`;
    tempFilePath = path.join(os.tmpdir(), fileName);
    await fs.writeFile(tempFilePath, response.data);

    // Send file to Unstructured.io
    const formData = new FormData();
    formData.append('files', fsSync.createReadStream(tempFilePath));

    const unstructuredResponse = await axios.post(
      process.env.UNSTRUCTURED_API_URL, 
      formData, 
      {
        headers: {
          'Accept': 'application/json',
          'unstructured-api-key': process.env.UNSTRUCTURED_API_KEY,
          ...formData.getHeaders()
        },
        timeout: 30000, // 30 second timeout for processing
        maxBodyLength: Infinity
      }
    );

    // Send the JSON response back to the client
    res.json(unstructuredResponse.data);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      tempFilePath: tempFilePath,
      stack: error.stack
    });

    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timeout' });
    }
    if (error.response?.status === 413) {
      return res.status(413).json({ error: 'File too large' });
    }
    if (error.code === 'ENOENT') {
      return res.status(500).json({ 
        error: 'File system error',
        message: 'Failed to create or access temporary file'
      });
    }
    if (axios.isAxiosError(error)) {
      return res.status(502).json({ 
        error: 'External service error',
        details: error.response?.data || error.message
      });
    }

    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  } finally {
    // Clean up temp file if it exists
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
    }
  }
});

// Error handling for unhandled routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
app.listen(PORT, host, () => {
  console.log(`Server running on ${host}:${PORT}`);
});