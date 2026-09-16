const favoriteService = require('../services/favoriteService');

async function addFavorite(req, res, next) {
  try {
    const favorite = await favoriteService.addFavorite(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { favorite },
    });
  } catch (err) {
    next(err);
  }
}

async function removeFavorite(req, res, next) {
  try {
    const result = await favoriteService.removeFavorite(req.user.id, req.params.id);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getFavorites(req, res, next) {
  try {
    const favorites = await favoriteService.getUserFavorites(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { favorites },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
};
