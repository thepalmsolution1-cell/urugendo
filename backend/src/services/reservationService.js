const prisma = require('../lib/prisma');
const { HttpError } = require('../utils/httpError');
const { createNotification } = require('./notificationService');
const { getOwnedProviderOrThrow } = require('./providerService');

/** FR-21: CONFIRMED only after provider accept. */
const PROVIDER_TRANSITIONS = {
  REQUESTED: ['PROCESSING', 'CONFIRMED', 'REJECTED'],
  PROCESSING: ['CONFIRMED', 'REJECTED'],
  CONFIRMED: [],
  REJECTED: [],
  CANCELLED: [],
};

async function createReservation(user, data) {
  const {
    providerId,
    planId,
    planComponentId,
    experienceId,
    reservedDate,
    reservedTime,
    people,
    specialRequest,
  } = data;

  if (!providerId || !reservedDate) {
    throw new HttpError(400, 'providerId and reservedDate are required.');
  }

  const provider = await prisma.provider.findUnique({ where: { id: providerId } });
  if (!provider || !provider.isActive) {
    throw new HttpError(404, 'Provider not found or inactive.');
  }
  if (provider.verificationStatus === 'SUSPENDED' || provider.verificationStatus === 'REJECTED') {
    throw new HttpError(400, 'This provider cannot accept reservations right now.');
  }

  if (experienceId) {
    const experience = await prisma.experience.findFirst({
      where: { id: experienceId, providerId },
    });
    if (!experience) {
      throw new HttpError(400, 'experienceId does not belong to this provider.');
    }
  }

  if (planId) {
    const plan = await prisma.experiencePlan.findFirst({
      where: { id: planId, userId: user.id },
    });
    if (!plan) {
      throw new HttpError(400, 'planId not found for this user.');
    }
  }

  const date = new Date(reservedDate);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, 'reservedDate must be a valid ISO date.');
  }

  const reservation = await prisma.reservation.create({
    data: {
      userId: user.id,
      providerId,
      planId: planId ?? null,
      planComponentId: planComponentId ?? null,
      experienceId: experienceId ?? null,
      reservedDate: date,
      reservedTime: reservedTime ?? null,
      people: people && Number.isInteger(people) && people > 0 ? people : 1,
      specialRequest: specialRequest ?? null,
      status: 'REQUESTED',
    },
    include: {
      provider: { select: { id: true, name: true } },
    },
  });

  if (provider.userId) {
    await createNotification({
      userId: provider.userId,
      type: 'RESERVATION_UPDATE',
      title: 'New reservation request',
      body: `${user.name} requested a reservation at ${provider.name}.`,
      payload: { reservationId: reservation.id, status: reservation.status },
    });
  }

  return reservation;
}

async function listMyReservations(userId) {
  return prisma.reservation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      provider: { select: { id: true, name: true, location: true } },
      experience: { select: { id: true, name: true, priceRwf: true } },
    },
  });
}

async function listProviderReservations(providerId, user, { status } = {}) {
  await getOwnedProviderOrThrow(providerId, user);
  return prisma.reservation.findMany({
    where: {
      providerId,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, contactPhone: true } },
      experience: { select: { id: true, name: true, priceRwf: true } },
    },
  });
}

async function updateReservationStatus(providerId, reservationId, user, { status, providerNote }) {
  await getOwnedProviderOrThrow(providerId, user);

  if (!status) {
    throw new HttpError(400, 'status is required.');
  }

  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, providerId },
  });
  if (!reservation) {
    throw new HttpError(404, 'Reservation not found for this provider.');
  }

  const allowed = PROVIDER_TRANSITIONS[reservation.status] || [];
  if (!allowed.includes(status)) {
    throw new HttpError(
      400,
      `Cannot move reservation from ${reservation.status} to ${status}. Allowed: ${allowed.join(', ') || 'none'}.`
    );
  }

  // FR-21: never claim CONFIRMED unless provider explicitly accepts (this path).
  const updated = await prisma.reservation.update({
    where: { id: reservationId },
    data: {
      status,
      providerNote: providerNote !== undefined ? providerNote : reservation.providerNote,
    },
    include: {
      provider: { select: { id: true, name: true } },
    },
  });

  await createNotification({
    userId: reservation.userId,
    type: status === 'REJECTED' ? 'PROVIDER_RESPONSE' : 'RESERVATION_UPDATE',
    title: `Reservation ${status.toLowerCase()}`,
    body: `Your reservation at ${updated.provider.name} is now ${status}.`,
    payload: {
      reservationId: updated.id,
      status: updated.status,
      providerNote: updated.providerNote,
    },
  });

  return updated;
}

module.exports = {
  createReservation,
  listMyReservations,
  listProviderReservations,
  updateReservationStatus,
};
