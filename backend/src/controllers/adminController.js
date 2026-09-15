const adminService = require('../services/adminService');

async function listProviders(req, res, next) {
  try {
    const data = await adminService.listProviders({
      verificationStatus: req.query.verificationStatus,
      category: req.query.category,
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function updateVerification(req, res, next) {
  try {
    const data = await adminService.updateProviderVerification(req.params.id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function updateProvider(req, res, next) {
  try {
    const data = await adminService.adminUpdateProvider(req.params.id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function listCategories(req, res, next) {
  try {
    res.json({ data: await adminService.listCategories() });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    res.status(201).json({ data: await adminService.createCategory(req.body) });
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    res.json({ data: await adminService.updateCategory(req.params.id, req.body) });
  } catch (err) {
    next(err);
  }
}

async function listTags(req, res, next) {
  try {
    res.json({ data: await adminService.listTags() });
  } catch (err) {
    next(err);
  }
}

async function createTag(req, res, next) {
  try {
    res.status(201).json({ data: await adminService.createTag(req.body) });
  } catch (err) {
    next(err);
  }
}

async function updateTag(req, res, next) {
  try {
    res.json({ data: await adminService.updateTag(req.params.id, req.body) });
  } catch (err) {
    next(err);
  }
}

async function listLocations(req, res, next) {
  try {
    res.json({ data: await adminService.listLocations() });
  } catch (err) {
    next(err);
  }
}

async function createLocation(req, res, next) {
  try {
    res.status(201).json({ data: await adminService.createLocation(req.body) });
  } catch (err) {
    next(err);
  }
}

async function updateLocation(req, res, next) {
  try {
    res.json({ data: await adminService.updateLocation(req.params.id, req.body) });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProviders,
  updateVerification,
  updateProvider,
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
