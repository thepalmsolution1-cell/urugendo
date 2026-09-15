const reservationService = require('../services/reservationService');

async function create(req, res, next) {
  try {
    const reservation = await reservationService.createReservation(req.user, req.body);
    res.status(201).json({ data: reservation });
  } catch (err) {
    next(err);
  }
}

async function listMine(req, res, next) {
  try {
    const reservations = await reservationService.listMyReservations(req.user.id);
    res.json({ data: reservations });
  } catch (err) {
    next(err);
  }
}

async function listForProvider(req, res, next) {
  try {
    const reservations = await reservationService.listProviderReservations(
      req.params.id,
      req.user,
      { status: req.query.status }
    );
    res.json({ data: reservations });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const reservation = await reservationService.updateReservationStatus(
      req.params.id,
      req.params.reservationId,
      req.user,
      req.body
    );
    res.json({ data: reservation });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  listMine,
  listForProvider,
  updateStatus,
};
