const planService = require('../services/planService');

async function createPlan(req, res, next) {
  try {
    const plan = await planService.createPlan(req.user.id, req.body);
    res.status(201).json({
      status: 'success',
      data: { plan },
    });
  } catch (err) {
    next(err);
  }
}

async function getPlans(req, res, next) {
  try {
    const plans = await planService.getUserPlans(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { plans },
    });
  } catch (err) {
    next(err);
  }
}

async function getPlan(req, res, next) {
  try {
    const plan = await planService.getPlanById(req.user.id, req.params.id);
    res.status(200).json({
      status: 'success',
      data: { plan },
    });
  } catch (err) {
    next(err);
  }
}

async function deletePlan(req, res, next) {
  try {
    const result = await planService.deletePlan(req.user.id, req.params.id);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPlan,
  getPlans,
  getPlan,
  deletePlan,
};
