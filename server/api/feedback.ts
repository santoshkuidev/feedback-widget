import { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'feedback-widget-8da54',
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? 
    process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : 
    '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCz6h3G5ZJUqGP1\nnWhZZHbOVqGVmR8O9Hhh2s1KEaEUoHru45Q9McMLpWDM5zDdcDwBPecvpe/NSTg0\nvLP2pKKP5j6/5I6a0D2BkrE0jDddpd/vbX6PDWdBlIMw4IpiNbeD+2AVmMcZTCko\nFxXtuXaPJZVG2uI9AqoQZ09W668tu8vVo7vc38ganYOfTXVK3DkQnzElPmobpRtk\nWw5nuSBP7tlfNadRrFFkMxFhzKegVceL7m+MiNaiBmt2VfBcthH0qxa+hjFlVojT\n46eIRkyvmfvZaLaNU1wi6ykB4xsQwIPl9O8TgsDhTAZVvkGTWYAA5X1lHHc2EQMi\nZujmzJfVAgMBAAECggEAWBlGnnwRBRJ17DI5hDh9MrnaIvKZck3E2wn055WtXnfc\n6riXAMYqv7uqJHv7AhvwzhzdZYgoXkpB0xUqPJbOoY853+ZP7EAXNik6S8RzYhCV\nEN15kRwbmVHbUeZJ7SBnriG8Iacvq1QPfTmcu81K4HqjV9Bb40s4MpMcFzCOleIi\nGMERZ1wUycPW1guu03fL0jLSAnl31fT0fAokR4WRyXcW3GPRNDUI5V2c2kWzFo1v\nFBeduNOB1SMuV7UYezkDMTQVr6d/MKHi1qQNdwi/EdArvgEC89lCETPbUHlfz4sn\nCGfvTMPmvGgq95HvcvoHWMV7zb2m3TBEwYVbyhVniwKBgQDsepeOLAHJF+Al+/Sk\nHLfvY47/UK3/CJziRv0NrQgfmIoYPgGbQ1z30dfBZaIUO5OpSeOwYDs1ueaOf7i/\n8yDgDcrcidkeSw9gVXwddcGVh/a4hzYmG0fSfxdiv3y+uG8mQEN1ISgSrGbjJ/K/\nfTr4aHuZKFfPUq+e4pCDglHAQwKBgQDCxCx0+L3lDdzmF8MM5XLZTi1s5y7d4PDm\n+kVCUQC5cJ3vsVZ2xD5r5Wc1bAGP6NcmJa99O+u2FL6pRqlgctMM/Vt95fazivib\nZaHU8g/AyGd1IReGoXOrKAu46ztJHdt3YJAtjCw7uTespuKvi404+k6c6l9E1S0N\nvxOlfVvyBwKBgB3NGTpWe2cfNiUzSlJAOEHX1xZ/0V2ZdUPi1FMb4jExJP4HGma5\np4ankDwUFcfc9i/YWvRIPE35/n8ow1yVRChYNJ90U8NIjEiEnV6ND3dLqiD5ES7e\nMz/ouka8gPj7/y3f3WBubEFmLpUj3KibHIpfiGv1tJMxBWbNgI7CJpFHAoGAMBWm\ntCpFF6vYgaYULbboJ+Y5KM3asES8tQnM15aQCzhWhbrOkfvZPWIhnPrRV+owU+ax\n8MU+aHGusLQVVQ6ENIzIbci8o48H2bW5wo0QfpP7lttYp5BssjDs0/afaGnKqSpZ\n7iTRNt1/dUyuYpCdiRejGPJ0GtZWjTJDc3QDozkCgYAf3BEcW2G+9Ay1yfam6ILy\n/Zc4Ve9zk/TAyrBXEdFOHBGyvDCcjPG8BhqFEXMYFhleTNSXGnHwASas9lucYYRf\nZrDUinLWKByOvRQGydeI33bXYzkRy4mrSC5hGnDEhumxEWVlm2tNnLK5mbsHsr7G\n9bfrPwfBbbCB45pBtnTrfQ==\n-----END PRIVATE KEY-----\n',
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@feedback-widget-8da54.iam.gserviceaccount.com',
};

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseConfig.projectId,
        privateKey: firebaseConfig.privateKey,
        clientEmail: firebaseConfig.clientEmail,
      }),
    });
    
    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
}

// Get Firestore database
const db = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key');

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
        rating,
        comment: comment || '',
        email: email || '',
        metadata: metadata || {},
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      
      // Save to Firestore
      const docRef = await db.collection('feedback').add(feedbackData);
      
      return res.status(201).json({ 
        id: docRef.id,
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
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!apiKey) {
        return res.status(401).json({ error: 'API key is required' });
      }
      
      // In a real app, validate the API key against a database
      // For now, we'll use a simple check
      if (apiKey !== 'test-api-key') {
        return res.status(403).json({ error: 'Invalid API key' });
      }
      
      // Get all feedback documents
      const snapshot = await db.collection('feedback').orderBy('createdAt', 'desc').get();
      
      const feedbackList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return res.status(200).json(feedbackList);
    } catch (error) {
      console.error('Error getting feedback:', error);
      return res.status(500).json({ error: 'Failed to get feedback' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}
