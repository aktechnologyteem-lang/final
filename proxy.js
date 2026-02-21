
/**
 * BACKEND PROXY EXAMPLE (Node.js/Express)
 * 
 * To protect your API Key, host this simple server (e.g., on Render or Vercel Functions).
 * Then, update `apifyService.ts` to call your proxy endpoint instead of Apify directly.
 */

/*
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const APIFY_TOKEN = process.env.APIFY_TOKEN; // Store securely in environment variables

app.post('/api/verify', async (req, res) => {
  try {
    const { emails } = req.body;
    
    const response = await axios.post(
      `https://api.apify.com/v2/acts/account56~email-verifier/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      { emails },
      { timeout: 55000 }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Proxy Error:', error.message);
    res.status(500).json({ 
        error: "Verification failed", 
        message: error.response?.data || error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
*/
