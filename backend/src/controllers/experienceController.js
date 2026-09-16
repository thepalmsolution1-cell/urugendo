const experienceService = require('../services/experienceService');

async function handleExperienceRequest(req, res, next) {
  try {
    const { text } = req.body;
    const userId = req.user ? req.user.id : null;

    const result = await experienceService.processExperienceRequest(userId, text);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function handleSearchExperiences(req, res, next) {
  try {
    const result = await experienceService.searchExperiences(req.query);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleExperienceRequest,
  handleSearchExperiences,
};
