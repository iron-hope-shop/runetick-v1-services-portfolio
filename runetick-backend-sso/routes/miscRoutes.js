const express = require('express');
const NodeCache = require('node-cache');
const RssParser = require('rss-parser');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
const newsCache = new NodeCache({ stdTTL: 300, checkperiod: 600 }); // Cache for 5 minutes

const parser = new RssParser();

router.get('/osrs-news', async (req, res) => {
    try {
        let cachedFeed = newsCache.get('osrsRssFeed');
        if (!cachedFeed) {
            const fetch = await import('node-fetch').then(module => module.default);
            const response = await fetch('https://secure.runescape.com/m=news/latest_news.rss?oldschool=true', {
                headers: {
                    'User-Agent': 'me@brad-jackson.com'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch RSS feed from RuneScape');
            }
            const feedText = await response.text();
            const feed = await parser.parseString(feedText);
            newsCache.set('osrsRssFeed', feed); // Cache the parsed feed
            cachedFeed = feed;
        }
        res.json(cachedFeed);
    } catch (error) {
        console.error('Error fetching or parsing RSS feed:', error);
        res.status(500).json({ error: 'Failed to fetch or parse RSS feed' });
    }
});

module.exports = router;
