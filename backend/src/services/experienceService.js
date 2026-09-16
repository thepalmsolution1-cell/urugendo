const prisma = require('../lib/prisma');
const mlService = require('./mlService');
const { HttpError } = require('../utils/httpError');

/**
 * Filter & Rank Pipeline for Experience Request
 */
async function processExperienceRequest(userId, text) {
  if (!text || typeof text !== 'string') {
    throw new HttpError(400, 'Text request is required');
  }

  // 1. Call ML Service extractIntent
  const intent = await mlService.extractIntent(text);

  const location = intent.location || null;
  const people = intent.people ? Number(intent.people) : null;
  const budgetRwf = intent.budget ? Number(intent.budget) : null;
  const occasion = intent.occasion || null;
  const preferences = Array.isArray(intent.preferences) ? intent.preferences : [];
  const experienceTypes = Array.isArray(intent.experience_types) ? intent.experience_types : [];

  // 2. Save ExperienceRequest in DB
  const experienceRequest = await prisma.experienceRequest.create({
    data: {
      userId: userId || null,
      rawText: text,
      extractedIntent: intent,
      location,
      people,
      budgetRwf,
      occasion,
      preferences,
      experienceTypes,
    },
  });

  // 3. HARD FILTER against Experience/Provider tables
  const whereClause = {
    isActive: true,
    verificationStatus: 'VERIFIED',
    availabilityStatus: {
      not: 'UNAVAILABLE',
    },
  };

  if (budgetRwf && budgetRwf > 0) {
    whereClause.priceRwf = {
      lte: budgetRwf,
    };
  }

  if (location) {
    whereClause.OR = [
      { location: { contains: location, mode: 'insensitive' } },
      { provider: { location: { contains: location, mode: 'insensitive' } } },
    ];
  }

  let candidateExperiences = await prisma.experience.findMany({
    where: whereClause,
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          category: true,
          location: true,
          rating: true,
          verificationStatus: true,
        },
      },
      categoryRef: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  // If hard location filter returned 0 results, fall back to removing strict location constraint so user still gets recommendations
  if (candidateExperiences.length === 0 && location) {
    delete whereClause.OR;
    candidateExperiences = await prisma.experience.findMany({
      where: whereClause,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            category: true,
            location: true,
            rating: true,
            verificationStatus: true,
          },
        },
        categoryRef: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  // 4. RANKING PIPELINE (soft matching within filtered set)
  const scored = candidateExperiences.map((exp) => {
    let score = 0;
    const expCategory = (exp.category || '').toUpperCase();
    const tagNames = exp.tags.map((t) => (t.tag.nameEn || '').toLowerCase());
    const expNameLower = (exp.name || '').toLowerCase();
    const expDescLower = (exp.description || '').toLowerCase();

    // Match experience_types (categories/types)
    for (const typeStr of experienceTypes) {
      const typeUpper = typeStr.toUpperCase();
      const typeLower = typeStr.toLowerCase();

      if (expCategory === typeUpper) {
        score += 10;
      } else if (tagNames.some((tag) => tag.includes(typeLower))) {
        score += 6;
      } else if (expNameLower.includes(typeLower)) {
        score += 4;
      }
    }

    // Match preferences keywords
    for (const pref of preferences) {
      const prefLower = pref.toLowerCase();
      if (tagNames.some((tag) => tag.includes(prefLower))) {
        score += 5;
      }
      if (expNameLower.includes(prefLower)) {
        score += 4;
      }
      if (expDescLower.includes(prefLower)) {
        score += 2;
      }
    }

    // Rating boost if provider has a rating
    if (exp.provider && exp.provider.rating) {
      score += exp.provider.rating;
    }

    return {
      ...exp,
      matchScore: score,
    };
  });

  // Sort by matchScore descending, then by priceRwf ascending
  scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.priceRwf - b.priceRwf;
  });

  return {
    request: experienceRequest,
    intent,
    candidates: scored,
  };
}

/**
 * General Search & Catalog Filter Endpoint
 */
async function searchExperiences(queryParams = {}) {
  const {
    location,
    category,
    price_min,
    price_max,
    q,
    page = 1,
    limit = 20,
  } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const where = {
    isActive: true,
    verificationStatus: 'VERIFIED',
  };

  if (location) {
    where.OR = [
      { location: { contains: String(location), mode: 'insensitive' } },
      { provider: { location: { contains: String(location), mode: 'insensitive' } } },
    ];
  }

  if (category) {
    where.category = String(category).toUpperCase();
  }

  if (price_min !== undefined || price_max !== undefined) {
    where.priceRwf = {};
    if (price_min !== undefined && !isNaN(Number(price_min))) {
      where.priceRwf.gte = Number(price_min);
    }
    if (price_max !== undefined && !isNaN(Number(price_max))) {
      where.priceRwf.lte = Number(price_max);
    }
  }

  if (q) {
    const searchStr = String(q);
    const searchConditions = [
      { name: { contains: searchStr, mode: 'insensitive' } },
      { description: { contains: searchStr, mode: 'insensitive' } },
      { provider: { name: { contains: searchStr, mode: 'insensitive' } } },
    ];

    if (where.OR) {
      where.AND = [
        { OR: where.OR },
        { OR: searchConditions },
      ];
      delete where.OR;
    } else {
      where.OR = searchConditions;
    }
  }

  const [total, experiences] = await Promise.all([
    prisma.experience.count({ where }),
    prisma.experience.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            category: true,
            location: true,
            rating: true,
          },
        },
        categoryRef: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  return {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    experiences,
  };
}

module.exports = {
  processExperienceRequest,
  searchExperiences,
};
