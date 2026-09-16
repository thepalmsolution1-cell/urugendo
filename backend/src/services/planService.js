const prisma = require('../lib/prisma');
const { HttpError } = require('../utils/httpError');

async function createPlan(userId, planData) {
  const title = planData.title || planData.name || 'My Experience Plan';
  const requestId = planData.requestId || planData.request_id || null;
  const location = planData.location || null;
  const startsAt = planData.startsAt || planData.starts_at ? new Date(planData.startsAt || planData.starts_at) : null;
  const people = planData.people ? parseInt(planData.people, 10) : 1;
  const budgetRwf = planData.budgetRwf !== undefined ? Number(planData.budgetRwf) : (planData.budget_rwf !== undefined ? Number(planData.budget_rwf) : null);
  const notes = planData.notes || null;
  const rawComponents = Array.isArray(planData.components) ? planData.components : [];

  // Fetch experiences to get snapshot details if component specifies experienceId
  const experienceIds = rawComponents
    .map((c) => c.experienceId || c.experience_id)
    .filter(Boolean);

  let experiencesMap = new Map();
  if (experienceIds.length > 0) {
    const exps = await prisma.experience.findMany({
      where: { id: { in: experienceIds } },
    });
    experiencesMap = new Map(exps.map((e) => [e.id, e]));
  }

  // Build normalized component data with snapshots
  const preparedComponents = rawComponents.map((comp, idx) => {
    const expId = comp.experienceId || comp.experience_id || null;
    const exp = expId ? experiencesMap.get(expId) : null;

    const componentType = comp.componentType || comp.component_type || (exp ? exp.category : 'OTHER');
    const name = comp.name || (exp ? exp.name : 'Custom Component');
    const priceRwf = comp.priceRwf !== undefined ? Number(comp.priceRwf) : (comp.price_rwf !== undefined ? Number(comp.price_rwf) : (exp ? exp.priceRwf : 0));
    const sortOrder = comp.sortOrder !== undefined ? Number(comp.sortOrder) : idx + 1;
    const providerId = comp.providerId || comp.provider_id || (exp ? exp.providerId : null);

    return {
      componentType,
      name,
      priceRwf,
      sortOrder,
      notes: comp.notes || null,
      experienceId: expId,
      providerId,
    };
  });

  const estimatedTotalRwf = preparedComponents.reduce((sum, c) => sum + c.priceRwf, 0);
  const remainingRwf = budgetRwf !== null ? budgetRwf - estimatedTotalRwf : null;

  // Create plan and nested components in transaction
  const plan = await prisma.experiencePlan.create({
    data: {
      userId,
      requestId,
      title,
      status: 'SAVED',
      location,
      startsAt,
      people,
      budgetRwf,
      estimatedTotalRwf,
      remainingRwf,
      notes,
      components: {
        create: preparedComponents,
      },
    },
    include: {
      components: {
        include: {
          experience: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  });

  return plan;
}

async function getUserPlans(userId) {
  return prisma.experiencePlan.findMany({
    where: { userId },
    include: {
      components: {
        include: {
          experience: {
            select: {
              id: true,
              name: true,
              category: true,
              photos: true,
            },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function getPlanById(userId, planId) {
  const plan = await prisma.experiencePlan.findFirst({
    where: {
      id: planId,
      userId,
    },
    include: {
      components: {
        include: {
          experience: {
            include: {
              provider: {
                select: {
                  id: true,
                  name: true,
                  location: true,
                  contactPhone: true,
                },
              },
            },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  });

  if (!plan) {
    throw new HttpError(404, 'Saved plan not found');
  }

  return plan;
}

async function deletePlan(userId, planId) {
  const existingPlan = await prisma.experiencePlan.findFirst({
    where: {
      id: planId,
      userId,
    },
  });

  if (!existingPlan) {
    throw new HttpError(404, 'Saved plan not found');
  }

  await prisma.experiencePlan.delete({
    where: { id: planId },
  });

  return { message: 'Plan removed successfully' };
}

module.exports = {
  createPlan,
  getUserPlans,
  getPlanById,
  deletePlan,
};
