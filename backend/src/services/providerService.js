const prisma = require('../lib/prisma');
const { HttpError } = require('../utils/httpError');

const PROVIDER_CATEGORIES = new Set([
  'RESTAURANT',
  'CAFE',
  'ACTIVITY',
  'ATTRACTION',
  'HOTEL',
  'TRANSPORT',
  'EVENT',
  'OTHER',
]);

const AVAILABILITY = new Set(['AVAILABLE', 'LIMITED', 'UNAVAILABLE', 'UNKNOWN']);

function assertCategory(category) {
  if (!PROVIDER_CATEGORIES.has(category)) {
    throw new HttpError(400, `Invalid category. Allowed: ${[...PROVIDER_CATEGORIES].join(', ')}`);
  }
}

async function getOwnedProviderOrThrow(providerId, user) {
  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider) {
    throw new HttpError(404, 'Provider not found.');
  }
  const isOwner = provider.userId === user.id;
  const isAdmin = user.role === 'ADMIN';
  if (!isOwner && !isAdmin) {
    throw new HttpError(403, 'Only the provider owner or an admin can manage this listing.');
  }
  return provider;
}

async function registerProvider(user, data) {
  const {
    name,
    category,
    description,
    contactEmail,
    contactPhone,
    location,
    address,
    priceRangeMin,
    priceRangeMax,
    photos,
  } = data;

  if (!name || !category || !contactEmail || !contactPhone || !location) {
    throw new HttpError(
      400,
      'name, category, contactEmail, contactPhone, and location are required.'
    );
  }
  assertCategory(category);

  const provider = await prisma.$transaction(async (tx) => {
    const created = await tx.provider.create({
      data: {
        name,
        category,
        description: description ?? null,
        contactEmail,
        contactPhone,
        location,
        address: address ?? null,
        priceRangeMin: priceRangeMin ?? null,
        priceRangeMax: priceRangeMax ?? null,
        photos: photos ?? [],
        verificationStatus: 'PENDING',
        userId: user.id,
        dataUpdatedAt: new Date(),
      },
    });

    if (user.role === 'USER') {
      await tx.user.update({
        where: { id: user.id },
        data: { role: 'PROVIDER' },
      });
    }

    return created;
  });

  return provider;
}

async function listMyProviders(userId) {
  return prisma.provider.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { experiences: true, menuItems: true, reservations: true } },
    },
  });
}

/** Public catalog listings for the consumer app (verified + active). */
async function listPublicProviders({ category, location, limit = 50 } = {}) {
  const take = Math.min(Number(limit) || 50, 100);
  return prisma.provider.findMany({
    where: {
      isActive: true,
      verificationStatus: 'VERIFIED',
      ...(category ? { category } : {}),
      ...(location
        ? { location: { contains: location, mode: 'insensitive' } }
        : {}),
    },
    orderBy: { dataUpdatedAt: 'desc' },
    take,
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      location: true,
      priceRangeMin: true,
      priceRangeMax: true,
      rating: true,
      photos: true,
      verificationStatus: true,
    },
  });
}

async function getProviderById(id) {
  const provider = await prisma.provider.findUnique({
    where: { id },
    include: {
      experiences: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
      menuItems: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!provider) {
    throw new HttpError(404, 'Provider not found.');
  }
  return provider;
}

async function updateProvider(providerId, user, data) {
  await getOwnedProviderOrThrow(providerId, user);

  const allowed = [
    'name',
    'category',
    'description',
    'contactEmail',
    'contactPhone',
    'location',
    'address',
    'priceRangeMin',
    'priceRangeMax',
    'photos',
    'isActive',
  ];

  const patch = {};
  for (const key of allowed) {
    if (data[key] !== undefined) {
      patch[key] = data[key];
    }
  }
  if (patch.category) {
    assertCategory(patch.category);
  }
  if (Object.keys(patch).length === 0) {
    throw new HttpError(400, 'No updatable fields provided.');
  }

  patch.dataUpdatedAt = new Date();

  return prisma.provider.update({
    where: { id: providerId },
    data: patch,
  });
}

async function createExperience(providerId, user, data) {
  const provider = await getOwnedProviderOrThrow(providerId, user);
  const {
    name,
    description,
    category,
    location,
    priceRwf,
    durationMinutes,
    capacity,
    availabilityStatus,
    photos,
    categoryId,
  } = data;

  if (!name || priceRwf === undefined || priceRwf === null) {
    throw new HttpError(400, 'name and priceRwf are required.');
  }
  if (!Number.isInteger(priceRwf) || priceRwf < 0) {
    throw new HttpError(400, 'priceRwf must be a non-negative integer (RWF).');
  }

  const resolvedCategory = category || provider.category;
  assertCategory(resolvedCategory);

  if (availabilityStatus && !AVAILABILITY.has(availabilityStatus)) {
    throw new HttpError(400, `Invalid availabilityStatus.`);
  }

  const [experience] = await prisma.$transaction([
    prisma.experience.create({
      data: {
        name,
        description: description ?? null,
        category: resolvedCategory,
        location: location || provider.location,
        priceRwf,
        durationMinutes: durationMinutes ?? null,
        capacity: capacity ?? null,
        availabilityStatus: availabilityStatus || 'UNKNOWN',
        photos: photos ?? [],
        categoryId: categoryId ?? null,
        providerId,
        verificationStatus: provider.verificationStatus,
      },
    }),
    prisma.provider.update({
      where: { id: providerId },
      data: { dataUpdatedAt: new Date() },
    }),
  ]);

  return experience;
}

async function updateExperience(providerId, experienceId, user, data) {
  await getOwnedProviderOrThrow(providerId, user);

  const existing = await prisma.experience.findFirst({
    where: { id: experienceId, providerId },
  });
  if (!existing) {
    throw new HttpError(404, 'Experience not found for this provider.');
  }

  const allowed = [
    'name',
    'description',
    'category',
    'location',
    'priceRwf',
    'durationMinutes',
    'capacity',
    'availabilityStatus',
    'photos',
    'isActive',
    'categoryId',
  ];
  const patch = {};
  for (const key of allowed) {
    if (data[key] !== undefined) {
      patch[key] = data[key];
    }
  }
  if (patch.category) {
    assertCategory(patch.category);
  }
  if (patch.availabilityStatus && !AVAILABILITY.has(patch.availabilityStatus)) {
    throw new HttpError(400, 'Invalid availabilityStatus.');
  }
  if (patch.priceRwf !== undefined && (!Number.isInteger(patch.priceRwf) || patch.priceRwf < 0)) {
    throw new HttpError(400, 'priceRwf must be a non-negative integer (RWF).');
  }
  if (Object.keys(patch).length === 0) {
    throw new HttpError(400, 'No updatable fields provided.');
  }

  const [experience] = await prisma.$transaction([
    prisma.experience.update({ where: { id: experienceId }, data: patch }),
    prisma.provider.update({
      where: { id: providerId },
      data: { dataUpdatedAt: new Date() },
    }),
  ]);

  return experience;
}

async function listExperiences(providerId) {
  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider) {
    throw new HttpError(404, 'Provider not found.');
  }
  return prisma.experience.findMany({
    where: { providerId },
    orderBy: { createdAt: 'desc' },
  });
}

async function createMenuItem(providerId, user, data) {
  await getOwnedProviderOrThrow(providerId, user);
  const { name, description, priceRwf, isAvailable } = data;
  if (!name || priceRwf === undefined || priceRwf === null) {
    throw new HttpError(400, 'name and priceRwf are required.');
  }
  if (!Number.isInteger(priceRwf) || priceRwf < 0) {
    throw new HttpError(400, 'priceRwf must be a non-negative integer (RWF).');
  }

  const [item] = await prisma.$transaction([
    prisma.menuItem.create({
      data: {
        providerId,
        name,
        description: description ?? null,
        priceRwf,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      },
    }),
    prisma.provider.update({
      where: { id: providerId },
      data: { dataUpdatedAt: new Date() },
    }),
  ]);

  return item;
}

async function updateMenuItem(providerId, menuItemId, user, data) {
  await getOwnedProviderOrThrow(providerId, user);
  const existing = await prisma.menuItem.findFirst({
    where: { id: menuItemId, providerId },
  });
  if (!existing) {
    throw new HttpError(404, 'Menu item not found for this provider.');
  }

  const allowed = ['name', 'description', 'priceRwf', 'isAvailable'];
  const patch = {};
  for (const key of allowed) {
    if (data[key] !== undefined) {
      patch[key] = data[key];
    }
  }
  if (patch.priceRwf !== undefined && (!Number.isInteger(patch.priceRwf) || patch.priceRwf < 0)) {
    throw new HttpError(400, 'priceRwf must be a non-negative integer (RWF).');
  }
  if (Object.keys(patch).length === 0) {
    throw new HttpError(400, 'No updatable fields provided.');
  }

  const [item] = await prisma.$transaction([
    prisma.menuItem.update({ where: { id: menuItemId }, data: patch }),
    prisma.provider.update({
      where: { id: providerId },
      data: { dataUpdatedAt: new Date() },
    }),
  ]);

  return item;
}

async function listMenuItems(providerId) {
  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider) {
    throw new HttpError(404, 'Provider not found.');
  }
  return prisma.menuItem.findMany({
    where: { providerId },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = {
  registerProvider,
  listMyProviders,
  listPublicProviders,
  getProviderById,
  updateProvider,
  createExperience,
  updateExperience,
  listExperiences,
  createMenuItem,
  updateMenuItem,
  listMenuItems,
  getOwnedProviderOrThrow,
};
