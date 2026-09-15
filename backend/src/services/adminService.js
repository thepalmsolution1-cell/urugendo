const prisma = require('../lib/prisma');
const { HttpError } = require('../utils/httpError');
const { createNotification } = require('./notificationService');

const VERIFICATION_TRANSITIONS = {
  PENDING: ['UNDER_REVIEW', 'REJECTED'],
  UNDER_REVIEW: ['VERIFIED', 'REJECTED'],
  VERIFIED: ['SUSPENDED'],
  REJECTED: ['UNDER_REVIEW'],
  SUSPENDED: ['VERIFIED', 'UNDER_REVIEW'],
};

function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function listProviders({ verificationStatus, category } = {}) {
  return prisma.provider.findMany({
    where: {
      ...(verificationStatus ? { verificationStatus } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, contactPhone: true, role: true } },
      _count: { select: { experiences: true, reservations: true } },
    },
  });
}

async function updateProviderVerification(providerId, { status, note }) {
  if (!status) {
    throw new HttpError(400, 'status is required.');
  }

  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider) {
    throw new HttpError(404, 'Provider not found.');
  }

  const allowed = VERIFICATION_TRANSITIONS[provider.verificationStatus] || [];
  if (!allowed.includes(status)) {
    throw new HttpError(
      400,
      `Cannot move verification from ${provider.verificationStatus} to ${status}. Allowed: ${allowed.join(', ') || 'none'}.`
    );
  }

  const updated = await prisma.provider.update({
    where: { id: providerId },
    data: {
      verificationStatus: status,
      dataUpdatedAt: new Date(),
    },
  });

  // Keep catalog experiences aligned with listing trust signal when verified/rejected/suspended
  if (['VERIFIED', 'REJECTED', 'SUSPENDED', 'UNDER_REVIEW'].includes(status)) {
    await prisma.experience.updateMany({
      where: { providerId },
      data: {
        verificationStatus: status === 'SUSPENDED' ? 'REJECTED' : status,
        ...(status === 'SUSPENDED' ? { isActive: false } : {}),
        ...(status === 'VERIFIED' ? { isActive: true } : {}),
      },
    });
  }

  if (provider.userId) {
    await createNotification({
      userId: provider.userId,
      type: 'SYSTEM',
      title: 'Provider verification update',
      body: `Your listing "${provider.name}" is now ${status}.${note ? ` Note: ${note}` : ''}`,
      payload: { providerId, status, note: note ?? null },
    });
  }

  return updated;
}

async function adminUpdateProvider(providerId, data) {
  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider) {
    throw new HttpError(404, 'Provider not found.');
  }

  const allowed = [
    'name',
    'description',
    'contactEmail',
    'contactPhone',
    'location',
    'address',
    'priceRangeMin',
    'priceRangeMax',
    'photos',
    'isActive',
    'category',
  ];
  const patch = {};
  for (const key of allowed) {
    if (data[key] !== undefined) {
      patch[key] = data[key];
    }
  }
  if (Object.keys(patch).length === 0) {
    throw new HttpError(400, 'No updatable fields provided.');
  }
  patch.dataUpdatedAt = new Date();

  return prisma.provider.update({ where: { id: providerId }, data: patch });
}

// --- Taxonomy (FR-27) ---

async function listCategories() {
  return prisma.category.findMany({ orderBy: { nameEn: 'asc' } });
}

async function createCategory(data) {
  const { nameEn, nameRw, description, slug, isActive } = data;
  if (!nameEn) {
    throw new HttpError(400, 'nameEn is required.');
  }
  const resolvedSlug = slug || slugify(nameEn);
  if (!resolvedSlug) {
    throw new HttpError(400, 'Could not derive a valid slug.');
  }
  try {
    return await prisma.category.create({
      data: {
        slug: resolvedSlug,
        nameEn,
        nameRw: nameRw ?? null,
        description: description ?? null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new HttpError(409, 'Category slug already exists.');
    }
    throw err;
  }
}

async function updateCategory(id, data) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, 'Category not found.');
  }
  const allowed = ['nameEn', 'nameRw', 'description', 'slug', 'isActive'];
  const patch = {};
  for (const key of allowed) {
    if (data[key] !== undefined) {
      patch[key] = data[key];
    }
  }
  if (Object.keys(patch).length === 0) {
    throw new HttpError(400, 'No updatable fields provided.');
  }
  try {
    return await prisma.category.update({ where: { id }, data: patch });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new HttpError(409, 'Category slug already exists.');
    }
    throw err;
  }
}

async function listTags() {
  return prisma.tag.findMany({ orderBy: { nameEn: 'asc' } });
}

async function createTag(data) {
  const { nameEn, nameRw, slug } = data;
  if (!nameEn) {
    throw new HttpError(400, 'nameEn is required.');
  }
  const resolvedSlug = slug || slugify(nameEn);
  try {
    return await prisma.tag.create({
      data: {
        slug: resolvedSlug,
        nameEn,
        nameRw: nameRw ?? null,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new HttpError(409, 'Tag slug already exists.');
    }
    throw err;
  }
}

async function updateTag(id, data) {
  const existing = await prisma.tag.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, 'Tag not found.');
  }
  const allowed = ['nameEn', 'nameRw', 'slug'];
  const patch = {};
  for (const key of allowed) {
    if (data[key] !== undefined) {
      patch[key] = data[key];
    }
  }
  if (Object.keys(patch).length === 0) {
    throw new HttpError(400, 'No updatable fields provided.');
  }
  try {
    return await prisma.tag.update({ where: { id }, data: patch });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new HttpError(409, 'Tag slug already exists.');
    }
    throw err;
  }
}

async function listLocations() {
  return prisma.location.findMany({ orderBy: { nameEn: 'asc' } });
}

async function createLocation(data) {
  const { nameEn, nameRw, region, slug, isActive } = data;
  if (!nameEn) {
    throw new HttpError(400, 'nameEn is required.');
  }
  const resolvedSlug = slug || slugify(nameEn);
  try {
    return await prisma.location.create({
      data: {
        slug: resolvedSlug,
        nameEn,
        nameRw: nameRw ?? null,
        region: region ?? null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new HttpError(409, 'Location slug already exists.');
    }
    throw err;
  }
}

async function updateLocation(id, data) {
  const existing = await prisma.location.findUnique({ where: { id } });
  if (!existing) {
    throw new HttpError(404, 'Location not found.');
  }
  const allowed = ['nameEn', 'nameRw', 'region', 'slug', 'isActive'];
  const patch = {};
  for (const key of allowed) {
    if (data[key] !== undefined) {
      patch[key] = data[key];
    }
  }
  if (Object.keys(patch).length === 0) {
    throw new HttpError(400, 'No updatable fields provided.');
  }
  try {
    return await prisma.location.update({ where: { id }, data: patch });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new HttpError(409, 'Location slug already exists.');
    }
    throw err;
  }
}

module.exports = {
  listProviders,
  updateProviderVerification,
  adminUpdateProvider,
  listCategories,
  createCategory,
  updateCategory,
  listTags,
  createTag,
  updateTag,
  listLocations,
  createLocation,
  updateLocation,
};
