const providerService = require('../services/providerService');

async function register(req, res, next) {
  try {
    const provider = await providerService.registerProvider(req.user, req.body);
    res.status(201).json({ data: provider });
  } catch (err) {
    next(err);
  }
}

async function listMine(req, res, next) {
  try {
    const providers = await providerService.listMyProviders(req.user.id);
    res.json({ data: providers });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const provider = await providerService.getProviderById(req.params.id);
    res.json({ data: provider });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const provider = await providerService.updateProvider(req.params.id, req.user, req.body);
    res.json({ data: provider });
  } catch (err) {
    next(err);
  }
}

async function createExperience(req, res, next) {
  try {
    const experience = await providerService.createExperience(
      req.params.id,
      req.user,
      req.body
    );
    res.status(201).json({ data: experience });
  } catch (err) {
    next(err);
  }
}

async function updateExperience(req, res, next) {
  try {
    const experience = await providerService.updateExperience(
      req.params.id,
      req.params.experienceId,
      req.user,
      req.body
    );
    res.json({ data: experience });
  } catch (err) {
    next(err);
  }
}

async function listExperiences(req, res, next) {
  try {
    const experiences = await providerService.listExperiences(req.params.id);
    res.json({ data: experiences });
  } catch (err) {
    next(err);
  }
}

async function createMenuItem(req, res, next) {
  try {
    const item = await providerService.createMenuItem(req.params.id, req.user, req.body);
    res.status(201).json({ data: item });
  } catch (err) {
    next(err);
  }
}

async function updateMenuItem(req, res, next) {
  try {
    const item = await providerService.updateMenuItem(
      req.params.id,
      req.params.menuItemId,
      req.user,
      req.body
    );
    res.json({ data: item });
  } catch (err) {
    next(err);
  }
}

async function listMenuItems(req, res, next) {
  try {
    const items = await providerService.listMenuItems(req.params.id);
    res.json({ data: items });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  listMine,
  getById,
  update,
  createExperience,
  updateExperience,
  listExperiences,
  createMenuItem,
  updateMenuItem,
  listMenuItems,
};
