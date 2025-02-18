const express = require('express');
const NodeCache = require('node-cache');

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
const latestPriceCache = new NodeCache({ stdTTL: 1, checkperiod: 1 });
const mappingsCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });
const indicesCache = new NodeCache({ stdTTL: 1, checkperiod: 1 });
const regulationsCache = new NodeCache({ stdTTL: 1, checkperiod: 1 });
const changesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 }); // 0 stdTTL means manual cache invalidation
const volumeCache = new NodeCache({ stdTTL: 0, checkperiod: 120 });

const ITEM_CATEGORIES = {
    ORE: {
        ids: [434, 1761, 449, 436, 444, 440, 447, 451, 442, 438, 3211, 21622, 453, 27616, 21347, 1625, 1617, 1621, 1627, 1629, 1619, 1623],
        description: "All minable"
    },
    FISH: {
        ids: [317, 327, 345, 321, 353, 335, 341, 349, 3379, 331, 359, 10138, 5001, 377, 22826, 363, 11328, 11330, 11332, 371, 22829, 7944, 3142, 383, 395, 389, 13439, 11934, 12934, 22835],
        description: "All fishable"
    },
    HERB: {
        ids: [249, 199, 201, 251, 253, 203, 255, 205, 207, 257, 2998, 3049, 259, 209, 261, 211, 263, 213, 3000, 3051, 265, 215, 2485, 2481, 267, 217, 269, 219],
        description: "All herbs"
    },
    BONE: {
        ids: [526, 2859, 528, 3183, 530, 532, 3125, 28899, 4812, 3123, 534, 22780, 6812, 536, 11943, 22124, 22783, 4830, 4832, 22786, 6729, 4834],
        description: "All bones"
    },
    LOG: {
        ids: [1511, 1521, 1519, 1517, 1515, 1513, 19669, 6333, 6332, 2862, 10810, 3239],
        description: "All logs"
    },
    BOND: {
        ids: [13190],
        description: "OSRS Bond"
    }
};

const USER_AGENT = "contacs: me@brad-jackson.com, 'r1zk' in osrs wiki disc, runetick.com"


// Function to calculate the time until the next 00:00 GMT
function getTimeUntilMidnightGMT() {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setUTCHours(24, 0, 0, 0);
    return nextMidnight - now;
}

router.get('/volume-data', async (req, res) => {
    const cacheKey = 'volumeData';
    const cachedData = volumeCache.get(cacheKey);

    if (cachedData) {
        return res.json(cachedData);
    }

    try {
        const response = await fetch('https://prices.runescape.wiki/api/v1/osrs/24h', {
            headers: { 'User-Agent': 'your-email@example.com' }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data from RuneScape API');
        }

        const data = await response.json();
        const transformedData = {};

        for (const [key, value] of Object.entries(data.data)) {
            transformedData[key] = {
                highPriceVolume: value.highPriceVolume,
                lowPriceVolume: value.lowPriceVolume
            };
        }

        const timeUntilMidnight = getTimeUntilMidnightGMT();
        
        // Cache the transformed data until the next 00:00 GMT
        volumeCache.set(cacheKey, transformedData, timeUntilMidnight / 1000);

        res.json(transformedData);
    } catch (error) {
        console.error('Error fetching volume data:', error);
        res.status(500).json({ error: 'Failed to fetch volume data' });
    }
});

router.get('/price', async (req, res) => {
    const { id, interval } = req.query;

    if (!id || !interval) {
        return res.status(400).json({ error: 'Item ID and interval are required' });
    }

    const validIntervals = ['5m', '1h', '6h', '24h'];
    if (!validIntervals.includes(interval)) {
        return res.status(400).json({ error: 'Invalid interval' });
    }

    const cacheKey = `${id}-${interval}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
        return res.json(cachedData);
    }

    try {
        const fetch = await import('node-fetch').then(module => module.default);

        // Fetch historical data
        const response = await fetch(`https://prices.runescape.wiki/api/v1/osrs/timeseries?timestep=${interval}&id=${id}`, {
            headers: {
                'User-Agent': USER_AGENT
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch data from RuneScape API');
        }
        const data = await response.json();
        const filledData = fillMissingData(data, interval);

        // Fetch latest price data
        const latestResponse = await fetch(`https://prices.runescape.wiki/api/v1/osrs/latest?id=${id}`, {
            headers: {
                'User-Agent': USER_AGENT
            }
        });
        if (!latestResponse.ok) {
            throw new Error('Failed to fetch latest data from RuneScape API');
        }
        const latestData = await latestResponse.json();

        // Combine historical data and latest data
        const combinedData = {
            ...filledData,
            latest: latestData
        };

        cache.set(cacheKey, combinedData);
        res.json(combinedData);
    } catch (error) {
        console.error('Error fetching item price:', error);
        res.status(500).json({ error: 'Failed to fetch item price' });
    }
});

function fillAllRealtimeData(data) {
    const result = {};
    for (const [id, itemData] of Object.entries(data)) {
        const { high, low } = itemData;
        if (!high || !low) {
            const lastPrice = high || low || 0; // Use the last known price or 0 if none
            result[id] = {
                ...itemData,
                high: high || lastPrice,
                low: low || lastPrice
            };
        } else {
            result[id] = itemData;
        }
    }
    return result;
}

// Function to calculate percentage changes
function calculatePercentChanges(data) {
    const result = {};
    for (const [id, itemData] of Object.entries(data)) {
        const { high, low } = itemData;
        let percentChange = null;
        if (high && low) {
            percentChange = ((high - low) / low * 100).toFixed(2);
        }
        result[id] = {
            ...itemData,
            percentChange: percentChange !== null ? parseFloat(percentChange) : null
        };
    }
    return result;
}


function fillMissingData(data, interval) {
    const result = { data: {} };
    const currentTime = new Date();

    let generateTimestamp, intervalCount;
    switch (interval) {
        case '5m':
            intervalCount = 5 * 60 * 1000;
            generateTimestamp = (time) => Math.floor(time / intervalCount) * intervalCount;
            break;
        case '1h':
            intervalCount = 60 * 60 * 1000;
            generateTimestamp = (time) => Math.floor(time / intervalCount) * intervalCount;
            break;
        case '6h':
            intervalCount = 6 * 60 * 60 * 1000;
            generateTimestamp = (time) => Math.floor(time / intervalCount) * intervalCount;
            break;
        case '24h':
            intervalCount = 24 * 60 * 60 * 1000;
            generateTimestamp = (time) => Math.floor(time / intervalCount) * intervalCount;
            break;
        default:
            throw new Error('Invalid interval');
    }

    // Create a map of existing data
    const existingData = new Map(data.data.map(entry => [entry.timestamp, entry]));

    // Fill missing timestamps
    for (let i = 0; i < 365; i++) {
        const timestamp = generateTimestamp(currentTime - i * intervalCount) / 1000; // Convert to seconds
        if (!existingData.has(timestamp)) {
            result.data[timestamp] = {
                avgHighPrice: 0,
                highPriceVolume: 0,
                avgLowPrice: 0,
                lowPriceVolume: 0
            };
        } else {
            result.data[timestamp] = existingData.get(timestamp);
        }
    }

    // Fill missing prices by looking forward and back
    const timestamps = Object.keys(result.data).map(Number).sort((a, b) => a - b);
    for (let i = 0; i < timestamps.length; i++) {
        const currentTimestamp = timestamps[i];
        const currentData = result.data[currentTimestamp];

        if (currentData.avgHighPrice === 0 || currentData.avgLowPrice === 0) {
            let prevHigh = null, nextHigh = null;
            let prevLow = null, nextLow = null;

            // Look backward for previous prices
            for (let j = i - 1; j >= 0; j--) {
                if (result.data[timestamps[j]].avgHighPrice !== 0) {
                    prevHigh = result.data[timestamps[j]].avgHighPrice;
                }
                if (result.data[timestamps[j]].avgLowPrice !== 0) {
                    prevLow = result.data[timestamps[j]].avgLowPrice;
                }
                if (prevHigh !== null && prevLow !== null) break;
            }

            // Look forward for next prices
            for (let j = i + 1; j < timestamps.length; j++) {
                if (result.data[timestamps[j]].avgHighPrice !== 0) {
                    nextHigh = result.data[timestamps[j]].avgHighPrice;
                }
                if (result.data[timestamps[j]].avgLowPrice !== 0) {
                    nextLow = result.data[timestamps[j]].avgLowPrice;
                }
                if (nextHigh !== null && nextLow !== null) break;
            }

            // Fill missing high price
            if (currentData.avgHighPrice === 0) {
                if (prevHigh !== null && nextHigh !== null) {
                    currentData.avgHighPrice = Math.floor((prevHigh + nextHigh) / 2);
                } else if (prevHigh !== null) {
                    currentData.avgHighPrice = prevHigh;
                } else if (nextHigh !== null) {
                    currentData.avgHighPrice = nextHigh;
                } else {
                    currentData.avgHighPrice = 0; // Default to 0 if no data available
                }
            }

            // Fill missing low price
            if (currentData.avgLowPrice === 0) {
                if (prevLow !== null && nextLow !== null) {
                    currentData.avgLowPrice = Math.floor((prevLow + nextLow) / 2);
                } else if (prevLow !== null) {
                    currentData.avgLowPrice = prevLow;
                } else if (nextLow !== null) {
                    currentData.avgLowPrice = nextLow;
                } else {
                    currentData.avgLowPrice = 0; // Default to 0 if no data available
                }
            }
        }
    }

    return result;
}

router.get('/latest-price', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Item ID is required' });
    }

    try {
        let latestData = latestPriceCache.get('latestPriceData');
        if (!latestData) {
            const fetch = await import('node-fetch').then(module => module.default);
            const response = await fetch('https://prices.runescape.wiki/api/v1/osrs/latest', {
                headers: {
                  'User-Agent': USER_AGENT
                }
              });
            if (!response.ok) {
                throw new Error('Failed to fetch data from RuneScape API');
            }
            latestData = await response.json();
            latestPriceCache.set('latestPriceData', latestData);
        }

        const itemData = latestData.data[id];
        if (!itemData) {
            return res.status(404).json({ error: 'Item not found' });
        }

        const result = processItemData(itemData);
        res.json(result);
    } catch (error) {
        console.error('Error fetching latest item price:', error);
        res.status(500).json({ error: 'Failed to fetch latest item price' });
    }
});

router.get('/mappings', async (req, res) => {
    try {
        let latestData = mappingsCache.get('latestMappingsData');
        if (!latestData) {
            const fetch = await import('node-fetch').then(module => module.default);
            const response = await fetch('https://prices.runescape.wiki/api/v1/osrs/mapping', {
                headers: {
                  'User-Agent': USER_AGENT
                }
              });
            if (!response.ok) {
                throw new Error('Failed to fetch mappings from RuneScape API');
            }
            latestData = await response.json();
            mappingsCache.set('latestMappingsData', latestData);
        }

        // // Add test new item latestData
        // const newItem = {
        //     "examine": "Fabulously ancient mage protection enchanted in the 3rd Age.",
        //     "id": 696969,
        //     "members": true,
        //     "lowalch": 696969,
        //     "limit": 69,
        //     "value": 696969,
        //     "highalch": 696969,
        //     "icon": "zt.png",
        //     "name": "6969"
        // };

        // // Ensure latestData is an array and add the new item
        // if (Array.isArray(latestData)) {
        //     latestData.push(newItem);
        // } else {
        //     console.error('latestData is not an array');
        //     return res.status(500).json({ error: 'Server error' });
        // }

        res.json(latestData);
    } catch (error) {
        console.error('Error fetching latest item price:', error);
        res.status(500).json({ error: 'Failed to fetch latest item price' });
    }
});

// TODO NEEDS TO BE A LIST , THEN THIS CAN BE USED FOR GETTING THE PRICE OF MULTIPLE ITEMS FOR
// the search and the positions
router.get('/multiple-items', async (req, res) => {
    const { ids } = req.query;
    if (!ids) {
        return res.status(400).json({ error: 'Item IDs are required' });
    }

    const itemIds = ids.split(',').map(id => id.trim());
    try {
        let latestData = latestPriceCache.get('latestPriceData');
        if (!latestData) {
            const fetch = await import('node-fetch').then(module => module.default);
            const response = await fetch('https://prices.runescape.wiki/api/v1/osrs/latest', {
                headers: {
                  'User-Agent': USER_AGENT
                }
              });
            if (!response.ok) {
                throw new Error('Failed to fetch data from RuneScape API');
            }
            latestData = await response.json();
            latestPriceCache.set('latestPriceData', latestData);
        }

        // Extract only the requested items
        const requestedItemsData = {};
        for (const id of itemIds) {
            if (latestData.data[id]) {
                requestedItemsData[id] = latestData.data[id];
            }
        }

        // Fill missing data for requested items
        const filledData = fillAllRealtimeData(requestedItemsData);

        const formattedData = formatItems(filledData);

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching multiple item prices:', error);
        res.status(500).json({ error: 'Failed to fetch multiple item prices' });
    }
});

// Existing endpoint to fetch latest prices and calculate percentage changes
router.get('/latest-prices', async (req, res) => {
    try {
        let latestData = latestPriceCache.get('latestPriceData');
        if (!latestData) {
            const fetch = await import('node-fetch').then(module => module.default);
            const response = await fetch('https://prices.runescape.wiki/api/v1/osrs/latest', { headers: { 'User-Agent': USER_AGENT }});
            if (!response.ok) {
                throw new Error('Failed to fetch data from RuneScape API');
            }
            latestData = await response.json();
            latestPriceCache.set('latestPriceData', latestData);
        }

        // Fill missing data
        const filledData = fillAllRealtimeData(latestData.data);
        // Calculate percentage changes
        const dataWithPercentChanges = calculatePercentChanges(filledData);
        // Store the last 10 changes
        storeLastTenChanges(dataWithPercentChanges);

        res.json(dataWithPercentChanges);
    } catch (error) {
        console.error('Error fetching latest price data:', error);
        res.status(500).json({ error: 'Failed to fetch latest price data' });
    }
});

// New endpoint to serve the past 10 changes
router.get('/changes', (req, res) => {
    const changes = changesCache.get('changes') || [];
    res.json(changes);
});

// Middleware to store the last 10 changes with timestamps and format them by ID
function storeLastTenChanges(dataWithPercentChanges) {
    let changes = changesCache.get('changes') || {};
    let counters = changesCache.get('counters') || {}; // Add a counters cache to track every fifth change
    const timestamp = Date.now();
    
    for (const [id, data] of Object.entries(dataWithPercentChanges)) {
        const { high, low, highTime, lowTime } = data;
        const isLastTradeLow = lowTime > highTime;
        const lastPrice = isLastTradeLow ? low : high;
        if (!changes[id]) {
            changes[id] = [];
        }
        if (!counters[id]) {
            counters[id] = 0; // Initialize counter if it doesn't exist
        }
        counters[id] += 1; // Increment the counter for each change
        
        // Only store the change when the counter reaches 5
        if (counters[id] === 5) {
            changes[id].push({ timestamp, lastPrice: lastPrice });
            counters[id] = 0; // Reset the counter after storing the fifth change
            
            // Ensure only the last 5 changes are stored
            if (changes[id].length > 5) {
                changes[id].shift(); // Remove the oldest change
            }
        }
    }

    changesCache.set('changes', changes);
    changesCache.set('counters', counters); // Update the counters cache
}

router.get('/regulations', async (req, res) => {
    try {
        let latestData = regulationsCache.get('lastestRegulationsData');
        if (!latestData) {
            const fetch = await import('node-fetch').then(module => module.default);
            const response = await fetch('https://oldschool.runescape.wiki/?title=User:Duralith/utils/untaxed_items.json&action=raw&ctype=application%2Fjson', {
                headers: {
                  'User-Agent': USER_AGENT
                }
              });
            if (!response.ok) {
                throw new Error('Failed to fetch data from RuneScape API');
            }
            latestData = await response.json();
            regulationsCache.set('lastestRegulationsData', latestData);
        }

        res.json(latestData);
    } catch (error) {
        console.error('Error fetching latest price data:', error);
        res.status(500).json({ error: 'Failed to fetch latest price data' });
    }
});

function processItemData(itemData) {
    const { high, highTime, low, lowTime } = itemData;
    const lastTradeTime = Math.max(highTime, lowTime);
    const isLastTradeLow = lowTime > highTime;
    const lastPrice = isLastTradeLow ? low : high;

    const prevPrice = isLastTradeLow ? high : low;
    const diff = lastPrice - prevPrice;
    const percentChange = ((diff) / prevPrice * 100).toFixed(2);

    return {
        lastPrice,
        highPrice: high,
        lowPrice: low,
        lastTradeTime,
        isDown: isLastTradeLow,
        percentChange
    };
}

function formatItems(items) {
    if (typeof items !== 'object' || items === null) {
        throw new TypeError('Expected an object but got ' + typeof items);
    }

    const formattedItems = {};

    for (const [id, item] of Object.entries(items)) {
        const { high, low, highTime, lowTime } = item;
        const lastTradeTime = Math.max(highTime, lowTime);
        const isLastTradeLow = lowTime > highTime;
        const lastPrice = isLastTradeLow ? low : high;

        formattedItems[id] = {
            lastPrice,
            highPrice: high,
            lowPrice: low,
            lastTradeTime,
            isDown: isLastTradeLow
        };
    }

    return formattedItems;
}

router.get('/alch-cost', async (req, res) => {
    try {
        let latestData = latestPriceCache.get('latestPriceData');
        if (!latestData) {
            const fetch = await import('node-fetch').then(module => module.default);
            const response = await fetch('https://prices.runescape.wiki/api/v1/osrs/latest', {
                headers: {
                  'User-Agent': USER_AGENT
                }
              });
            if (!response.ok) {
                throw new Error('Failed to fetch data from RuneScape API');
            }
            latestData = await response.json();
            latestPriceCache.set('latestPriceData', latestData);
        }

        const fireRuneId = '554';
        const natureRuneId = '561';

        const fireRuneData = latestData.data[fireRuneId];
        const natureRuneData = latestData.data[natureRuneId];

        if (!fireRuneData || !natureRuneData) {
            return res.status(404).json({ error: 'Rune data not found' });
        }

        const fireRunePrice = fireRuneData.low; // Using low price for conservative estimate
        const natureRunePrice = natureRuneData.low;

        const alchCost = (5 * fireRunePrice) + natureRunePrice;

        const result = {
            alchCost,
            fireRunePrice,
            natureRunePrice,
            timestamp: Date.now()
        };

        res.json(result);
    } catch (error) {
        console.error('Error fetching alch cost:', error);
        res.status(500).json({ error: 'Failed to fetch alch cost' });
    }
});

router.get('/indices', async (req, res) => {
    try {
        let cachedIndices = indicesCache.get('itemIndices');
        if (cachedIndices) {
            return res.json(cachedIndices);
        }

        let latestData = latestPriceCache.get('latestPriceData');
        if (!latestData) {
            const fetch = await import('node-fetch').then(module => module.default);
            const response = await fetch('https://prices.runescape.wiki/api/v1/osrs/latest', {
                headers: {
                  'User-Agent': USER_AGENT
                }
              });
            if (!response.ok) {
                throw new Error('Failed to fetch data from RuneScape API');
            }
            latestData = await response.json();
            latestPriceCache.set('latestPriceData', latestData);
        }

        const indices = {};
        for (const [category, { ids, description }] of Object.entries(ITEM_CATEGORIES)) {
            const itemsData = ids.map(id => {
                const itemData = latestData.data[id];
                return itemData ? processItemData(itemData) : null;
            }).filter(Boolean);

            if (itemsData.length > 0) {
                const averagePrice = itemsData.reduce((sum, item) => sum + item.lastPrice, 0) / itemsData.length;
                const validPercentChanges = itemsData
                    .map(item => item.percentChange)
                    .filter(change => change !== null && !isNaN(change));

                const averagePercentChange = validPercentChanges.length > 0
                    ? validPercentChanges.reduce((sum, change) => sum + parseFloat(change), 0) / validPercentChanges.length
                    : null;

                const isDown = averagePercentChange !== null ? averagePercentChange < 0 : null;

                const itemsObject = ids.reduce((obj, id, index) => {
                    obj[id] = itemsData[index];
                    return obj;
                }, {});

                indices[category] = {
                    itemIds: ids, // Added IDs of items in the category
                    itemsData: itemsObject,
                    averagePrice: Math.round(averagePrice),
                    averagePercentChange: averagePercentChange !== null ? parseFloat(averagePercentChange.toFixed(2)) : null,
                    description,
                    isDown,
                    timestamp: Date.now(),
                };
            }
        }

        indicesCache.set('itemIndices', indices);
        res.json(indices);
    } catch (error) {
        console.error('Error calculating item indices:', error);
        res.status(500).json({ error: 'Failed to calculate item indices' });
    }
});

module.exports = router;
