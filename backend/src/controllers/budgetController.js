const budgetService = require('../services/budgetService');

async function handleCalculateBudget(req, res, next) {
  try {
    const { experience_ids, experienceIds, items, budget, budgetRwf, budget_rwf } = req.body;
    const ids = experience_ids || experienceIds;

    const result = await budgetService.calculateBudget({
      experienceIds: ids,
      items,
      budget,
      budgetRwf: budgetRwf || budget_rwf,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleCalculateBudget,
};
