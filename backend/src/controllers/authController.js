const authService = require('../services/authService');

async function register(req, res, next) {
  try {
    const { email, contactPhone, contact_phone, password, name, preferredLanguage, preferred_language } = req.body;
    const phone = contactPhone || contact_phone;
    const lang = preferredLanguage || preferred_language;

    const result = await authService.registerUser({
      email,
      contactPhone: phone,
      password,
      name,
      preferredLanguage: lang,
    });

    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { credential, email, contactPhone, contact_phone, password } = req.body;
    const phone = contactPhone || contact_phone;

    const result = await authService.loginUser({
      credential,
      email,
      contactPhone: phone,
      password,
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
  register,
  login,
};
