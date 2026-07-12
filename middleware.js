function requireLogin(req, res, next) {
  if (typeof next === "function") {
    next();
  }
}

function requireRole(allowedRoles) {
  return function roleMiddleware(req, res, next) {
    req.allowedRoles = allowedRoles;
    if (typeof next === "function") {
      next();
    }
  };
}

module.exports = {
  requireLogin,
  requireRole,
};
