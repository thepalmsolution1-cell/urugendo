const prisma = require('../lib/prisma');
const { HttpError } = require('../utils/httpError');

async function addFavorite(userId, { providerId, provider_id, experienceId, experience_id }) {
  const pId = providerId || provider_id || null;
  const eId = experienceId || experience_id || null;

  if (!pId && !eId) {
    throw new HttpError(400, 'Either provider_id or experience_id must be provided');
  }

  if (pId && eId) {
    throw new HttpError(400, 'Please specify either provider_id or experience_id, not both');
  }

  if (pId) {
    const providerExists = await prisma.provider.findUnique({ where: { id: pId } });
    if (!providerExists) {
      throw new HttpError(404, 'Provider not found');
    }

    const existingFav = await prisma.favorite.findUnique({
      where: {
        userId_providerId: {
          userId,
          providerId: pId,
        },
      },
    });

    if (existingFav) {
      return existingFav;
    }

    return prisma.favorite.create({
      data: {
        userId,
        providerId: pId,
      },
      include: {
        provider: true,
      },
    });
  }

  if (eId) {
    const expExists = await prisma.experience.findUnique({ where: { id: eId } });
    if (!expExists) {
      throw new HttpError(404, 'Experience not found');
    }

    const existingFav = await prisma.favorite.findUnique({
      where: {
        userId_experienceId: {
          userId,
          experienceId: eId,
        },
      },
    });

    if (existingFav) {
      return existingFav;
    }

    return prisma.favorite.create({
      data: {
        userId,
        experienceId: eId,
      },
      include: {
        experience: {
          include: {
            provider: true,
          },
        },
      },
    });
  }
}

async function removeFavorite(userId, id) {
  // First check if id matches a Favorite record ID owned by user
  let fav = await prisma.favorite.findFirst({
    where: {
      id,
      userId,
    },
  });

  // If not found by Favorite ID, check if it matches a providerId or experienceId for this user
  if (!fav) {
    fav = await prisma.favorite.findFirst({
      where: {
        userId,
        OR: [
          { providerId: id },
          { experienceId: id },
        ],
      },
    });
  }

  if (!fav) {
    throw new HttpError(404, 'Favorite not found');
  }

  await prisma.favorite.delete({
    where: { id: fav.id },
  });

  return { message: 'Favorite removed successfully' };
}

async function getUserFavorites(userId) {
  return prisma.favorite.findMany({
    where: { userId },
    include: {
      provider: {
        select: {
          id: true,
          name: true,
          category: true,
          location: true,
          rating: true,
          photos: true,
          verificationStatus: true,
        },
      },
      experience: {
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              location: true,
              rating: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

module.exports = {
  addFavorite,
  removeFavorite,
  getUserFavorites,
};
