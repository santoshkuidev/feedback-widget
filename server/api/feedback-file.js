// Simple feedback API that stores data in memory and optionally to a JSON file
const fs = require('fs').promises;
const path = require('path');

// In-memory storage for feedback
let feedbackItems = [];

// Path to JSON file for persistent storage
const dataFilePath = path.join(__dirname, '../data/feedback.json');

// Ensure the data directory exists
async function ensureDataDirectory() {
  try {
    await fs.mkdir(path.join(__dirname, '../data'), { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

// Load existing feedback from file
async function loadFeedback() {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(dataFilePath, 'utf8');
    feedbackItems = JSON.parse(data);
    console.log(`Loaded ${feedbackItems.length} feedback items from file`);
  } catch (error) {
    // If file doesn't exist or has invalid JSON, start with empty array
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      feedbackItems = [];
      console.log('No existing feedback file, starting with empty array');
    } else {
      console.error('Error loading feedback from file:', error);
    }
  }
}

// Save feedback to file
async function saveFeedback() {
  try {
    await ensureDataDirectory();
    await fs.writeFile(dataFilePath, JSON.stringify(feedbackItems, null, 2), 'utf8');
    console.log(`Saved ${feedbackItems.length} feedback items to file`);
  } catch (error) {
    console.error('Error saving feedback to file:', error);
  }
}

// Initialize by loading existing feedback
loadFeedback();

module.exports = async (req, res) => {
  // Always enable CORS for all origins
  const origin = req.headers.origin || '*';
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Log request information for debugging
  console.log('Received request:', {
    method: req.method,
    url: req.url,
    origin: origin,
    headers: req.headers,
    body: req.body
  });

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle POST request (submit feedback)
  if (req.method === 'POST') {
    try {
      const { rating, comment, email, metadata } = req.body;
      
      // Validate required fields
      if (!rating) {
        return res.status(400).json({ error: 'Rating is required' });
      }
      
      // Create feedback document
      const feedbackData = {
        id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        rating,
        comment: comment || '',
        email: email || '',
        metadata: metadata || {},
        createdAt: new Date().toISOString(),
      };
      
      // Log the data we're about to save
      console.log('Saving feedback data:', JSON.stringify(feedbackData));
      
      // Add to in-memory array
      feedbackItems.push(feedbackData);
      
      // Save to file (don't await to avoid blocking response)
      saveFeedback().catch(err => console.error('Error saving to file:', err));
      
      return res.status(201).json({ 
        id: feedbackData.id,
        message: 'Feedback submitted successfully' 
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return res.status(500).json({ error: 'Failed to submit feedback' });
    }
  }
  
  // Handle GET request (get all feedback)
  if (req.method === 'GET') {
    try {
      // Check for API key
      const apiKey = req.headers['x-api-key'];
      
      if (!apiKey) {
        return res.status(401).json({ error: 'API key is required' });
      }
      
      // In a real app, validate the API key against a database
      // For now, we'll use a simple check
      if (apiKey !== 'test-api-key') {
        return res.status(403).json({ error: 'Invalid API key' });
      }
      
      return res.status(200).json(feedbackItems);
    } catch (error) {
      console.error('Error getting feedback:', error);
      return res.status(500).json({ error: 'Failed to get feedback' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
};
