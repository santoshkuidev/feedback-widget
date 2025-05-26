module.exports = (req, res) => {
  // Always enable CORS for all origins
  const origin = req.headers.origin || '*';
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Log request information for debugging
  console.log('Health check request:', {
    method: req.method,
    url: req.url,
    origin: origin
  });

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle GET request
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'ok', 
      message: 'API is running',
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
};
