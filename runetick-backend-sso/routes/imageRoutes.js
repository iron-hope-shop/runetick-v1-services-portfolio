// const express = require('express');
// const router = express.Router();
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
// const NodeCache = require('node-cache');
// const imageCache = new NodeCache({ stdTTL: 86400, checkperiod: 120 });

// router.get('/image-proxy', async (req, res) => {
//   const { url } = req.query;

//   if (!url) {
//     return res.status(400).json({ error: 'Image URL is required' });
//   }

//   try {
//     const cachedImage = imageCache.get(url);
//     if (cachedImage) {
//       res.setHeader('Content-Type', cachedImage.contentType);
//       return res.send(Buffer.from(cachedImage.data, 'base64'));
//     }

//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error('Failed to fetch image');
//     }

//     const contentType = response.headers.get('content-type');
//     const buffer = await response.buffer();
//     const base64Image = buffer.toString('base64');

//     imageCache.set(url, { contentType, data: base64Image });

//     res.setHeader('Content-Type', contentType);
//     res.send(buffer);
//   } catch (error) {
//     console.error('Error fetching image:', error);
//     res.status(500).json({ error: 'Failed to fetch image' });
//   }
// });

// module.exports = router;