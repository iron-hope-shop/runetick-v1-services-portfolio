const express = require('express');
const { body, validationResult } = require('express-validator');
const { getUserSettings, getUserLogs, getUserWatchlist, downloadFile, uploadFile, addUserToBetaList } = require('../models/fileHelpers');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Middleware for log validation
const validateLog = [
  body('modifier').isIn(['CREATE', 'DELETE']).withMessage('Invalid action'),
  body('action').isIn(['TRADE', 'PICKUP', 'DROP']).withMessage('Invalid action'),
  body('item').isInt().withMessage('Item must be an integer'),
  body('price')
    .customSanitizer(value => {
      if (value === null) return 0;
      return Math.abs(parseInt(value, 10));
    })
    .isInt({ min: 0 }).withMessage('Price must be a non-negative integer'),
  body('quantity')
    .customSanitizer(value => Math.abs(parseInt(value, 10)))
    .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('timestamp').isInt().custom(value => {
    if (value > Date.now()) {
      throw new Error('Timestamp must be in the past');
    }
    return true;
  }).withMessage('Invalid timestamp'),
  body('tradeType').custom((value, { req }) => {
    if (req.body.action === 'TRADE' && !['BUY', 'SELL'].includes(value)) {
      throw new Error('Invalid tradeType for TRADE action');
    }
    if (req.body.action !== 'TRADE' && value !== null) {
      throw new Error('tradeType must be null for non-TRADE actions');
    }
    return true;
  }).withMessage('Invalid tradeType'),
];

// Middleware for watchlist validation
const validateWatchlistItem = [
  body('itemId').isInt().withMessage('Item ID must be an integer'),
];

router.post('/logs', validateLog, async (req, res) => {
  const { uid } = req.user; // Assuming you have user authentication middleware
  let log = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Convert TRADE actions with price 0 to PICKUP or DROP
  if (log.action === 'TRADE' && log.price === 0) {
    if (log.tradeType === 'BUY') {
      log.action = 'PICKUP';
      log.tradeType = null;
    } else if (log.tradeType === 'SELL') {
      log.action = 'DROP';
      log.tradeType = null;
    }
  }

  // Generate a UUID for the log
  log.id = uuidv4();

  try {
    let logs = await getUserLogs(uid);
    logs.push(log);
    await uploadFile(uid, 'logs.json', logs);

    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// Read all logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await getUserLogs(req.user.uid);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// // Update a log
// router.put('/logs/:logId', validateLog, async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const logs = await getUserLogs(req.user.uid);
//     const logIndex = logs.findIndex(log => log.id === req.params.logId);
//     if (logIndex === -1) {
//       return res.status(404).json({ error: 'Log not found' });
//     }

//     logs[logIndex] = { ...logs[logIndex], ...req.body };
//     await uploadFile(req.user.uid, 'logs.json', logs);
//     res.json(logs[logIndex]);
//   } catch (error) {
//     console.error('Error updating log:', error);
//     res.status(500).json({ error: 'Failed to update log' });
//   }
// });

// Delete a log
router.delete('/logs/:logId', async (req, res) => {
  const { uid } = req.user; // Assuming you have user authentication middleware
  const { logId } = req.params;

  try {
    let logs = await getUserLogs(uid);
    const logIndex = logs.findIndex(log => log.id === logId);

    if (logIndex === -1) {
      return res.status(404).json({ error: 'Log not found' });
    }

    // Remove the log from the array
    logs.splice(logIndex, 1);

    // Update the logs file
    await uploadFile(uid, 'logs.json', logs);

    res.status(200).json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

// Create a watchlist item
router.post('/watchlist', validateWatchlistItem, async (req, res) => {
  const { uid } = req.user;
  const { itemId } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let watchlist = await getUserWatchlist(uid);
    if (!watchlist.includes(itemId)) {
      watchlist.push(itemId);
      await uploadFile(uid, 'watchlist.json', watchlist);
    }

    res.status(201).json({ itemId });
  } catch (error) {
    console.error('Error creating watchlist item:', error);
    res.status(500).json({ error: 'Failed to create watchlist item' });
  }
});

// Read all watchlist items
router.get('/watchlist', async (req, res) => {
  try {
    const watchlist = await getUserWatchlist(req.user.uid);
    res.json(watchlist);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Delete a watchlist item
router.delete('/watchlist/:itemId', async (req, res) => {
  const { uid } = req.user;
  const { itemId } = req.params;

  try {
    let watchlist = await getUserWatchlist(uid);
    const itemIndex = watchlist.indexOf(parseInt(itemId, 10));
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Watchlist item not found' });
    }

    watchlist.splice(itemIndex, 1);
    await uploadFile(uid, 'watchlist.json', watchlist);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting watchlist item:', error);
    res.status(500).json({ error: 'Failed to delete watchlist item' });
  }
});

// Create or retrieve a user and return user settings
router.post('/', async (req, res) => {
  const { uid, email } = req.user;

  try {
    let user = await getUserSettings(uid);
    if (!user) {
      user = {
        uid,
        email,
        timezone: 'GMT+0',
        language: 'en',
        ign: '',
        highlight: '#000000',
        notify: true,
        active: true,
        subscriptionPlan: 0,
      };
      await uploadFile(uid, 'settings.json', user);
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error retrieving or creating user:', error);
    res.status(500).json({ error: 'Failed to retrieve or create user' });
  }
});

// Get user data
router.get('/', async (req, res) => {
  try {
    const user = await getUserSettings(req.user.uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(400).json({ error: 'Failed to fetch user data' });
  }
});

// Update user data
router.put('/', async (req, res) => {
  try {
    let user = await getUserSettings(req.user.uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user = { ...user, ...req.body };
    await uploadFile(req.user.uid, 'settings.json', user);
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ error: 'Failed to update user data' });
  }
});

// Delete user
router.delete('/', async (req, res) => {
  try {
    const user = await getUserSettings(req.user.uid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await bucket.file(`users/${req.user.uid}/settings.json`).delete();
    await bucket.file(`users/${req.user.uid}/logs.json`).delete();
    await bucket.file(`users/${req.user.uid}/watchlist.json`).delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(400).json({ error: 'Failed to delete user' });
  }
});

router.post('/join-beta', async (req, res) => {
  const { uid } = req.user; // Assuming you have user authentication middleware

  try {
    await addUserToBetaList(uid);
    res.status(200).json({ message: 'User added to beta list' });
  } catch (error) {
    console.error('Error adding user to beta list:', error);
    res.status(500).json({ error: 'Failed to add user to beta list' });
  }
});

module.exports = router;
