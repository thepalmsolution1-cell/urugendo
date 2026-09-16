const prisma = require('../lib/prisma');

/**
 * Pure backend budget calculation engine (FR-12–14)
 * Evaluates proposed plan components against budget limit.
 */
async function calculateBudget({ experienceIds = [], items = [], budget, budgetRwf, budget_rwf }) {
  const budgetAmount = Number(budget !== undefined ? budget : (budgetRwf !== undefined ? budgetRwf : budget_rwf)) || 0;

  let components = [];
  let totalCost = 0;

  // Option 1: Experience IDs array passed in
  if (Array.isArray(experienceIds) && experienceIds.length > 0) {
    const experiences = await prisma.experience.findMany({
      where: {
        id: {
          in: experienceIds,
        },
      },
      select: {
        id: true,
        name: true,
        category: true,
        priceRwf: true,
        location: true,
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Maintain order as passed in experienceIds
    const expMap = new Map(experiences.map((e) => [e.id, e]));

    components = experienceIds
      .map((id) => expMap.get(id))
      .filter(Boolean)
      .map((exp, index) => ({
        experienceId: exp.id,
        name: exp.name,
        componentType: exp.category,
        priceRwf: exp.priceRwf,
        sortOrder: index + 1,
        providerId: exp.provider ? exp.provider.id : null,
        providerName: exp.provider ? exp.provider.name : null,
      }));
  }
  // Option 2: Full items array provided (e.g., custom components or custom prices)
  else if (Array.isArray(items) && items.length > 0) {
    components = items.map((item, index) => {
      const price = Number(item.priceRwf || item.price_rwf || item.price) || 0;
      return {
        experienceId: item.experienceId || item.experience_id || null,
        name: item.name || 'Custom Component',
        componentType: item.componentType || item.component_type || 'OTHER',
        priceRwf: price,
        sortOrder: item.sortOrder || index + 1,
        notes: item.notes || null,
      };
    });
  }

  totalCost = components.reduce((sum, item) => sum + (Number(item.priceRwf) || 0), 0);
  const difference = budgetAmount - totalCost;
  const withinBudget = budgetAmount > 0 ? totalCost <= budgetAmount : true;

  return {
    total_cost: totalCost,
    budget: budgetAmount,
    difference,
    within_budget: withinBudget,
    components,
  };
}

module.exports = {
  calculateBudget,
};
