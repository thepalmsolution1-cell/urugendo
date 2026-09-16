const axios = require('axios');
const config = require('../config');

/**
 * Client service to communicate with python ml-service for intent extraction.
 */
async function extractIntent(text) {
  try {
    const response = await axios.post(`${config.mlServiceUrl}/api/v1/extract-intent`, {
      text,
    }, {
      timeout: 10000,
    });

    return response.data;
  } catch (err) {
    console.warn('[ML Service Call Failed]:', err.message || err);

    // Fallback basic text extraction if ML service is offline/unreachable in local dev
    return fallbackExtractIntent(text);
  }
}

/**
 * Basic fallback parser when ML service is offline.
 */
function fallbackExtractIntent(text) {
  const lowerText = text.toLowerCase();
  
  // Extract number of people
  const peopleMatch = lowerText.match(/(\d+)\s*(people|person|pax|guests)/i);
  const people = peopleMatch ? parseInt(peopleMatch[1], 10) : null;

  // Extract budget in RWF (e.g. 50000, 50k, 50,000 rwf)
  let budget = null;
  const budgetMatch = lowerText.match(/(\d+[\d,]*)\s*(rwf|frw|k)?/i);
  if (budgetMatch) {
    let rawNum = budgetMatch[1].replace(/,/g, '');
    let num = parseInt(rawNum, 10);
    if (budgetMatch[2] && budgetMatch[2].toLowerCase() === 'k') {
      num *= 1000;
    }
    if (num > 500) {
      budget = num;
    }
  }

  // Common Rwanda locations
  const locations = ['kigali', 'musanze', 'rubavu', 'gisenyi', 'huye', 'karongi', 'akagera', 'nyungwe'];
  const matchedLocation = locations.find((loc) => lowerText.includes(loc));
  const location = matchedLocation ? matchedLocation.charAt(0).toUpperCase() + matchedLocation.slice(1) : null;

  // Common categories
  const categoryKeywords = {
    RESTAURANT: ['restaurant', 'food', 'dine', 'dinner', 'lunch', 'eat', 'cuisine'],
    CAFE: ['cafe', 'coffee', 'bakery', 'breakfast'],
    ACTIVITY: ['activity', 'hike', 'hiking', 'tour', 'adventure', 'kayak', 'zip line'],
    ATTRACTION: ['attraction', 'museum', 'park', 'canopy'],
    HOTEL: ['hotel', 'resort', 'stay', 'lodge'],
    TRANSPORT: ['transport', 'car', 'taxi', 'bus'],
    EVENT: ['event', 'concert', 'festival'],
  };

  const experience_types = [];
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => lowerText.includes(kw))) {
      experience_types.push(cat);
    }
  }

  // Occasion
  const occasions = ['birthday', 'anniversary', 'date', 'honeymoon', 'weekend', 'vacation', 'trip'];
  const matchedOccasion = occasions.find((occ) => lowerText.includes(occ));

  // Extract preference keywords
  const preferenceTokens = ['cozy', 'calm', 'affordable', 'luxury', 'quiet', 'romantic', 'family', 'outdoor'];
  const preferences = preferenceTokens.filter((token) => lowerText.includes(token));

  return {
    location,
    people,
    budget,
    occasion: matchedOccasion || null,
    preferences: preferences.length > 0 ? preferences : [],
    experience_types: experience_types.length > 0 ? experience_types : [],
  };
}

module.exports = {
  extractIntent,
  fallbackExtractIntent,
};
