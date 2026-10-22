const requireRole = (...allowedRoles) => {
  const normalizedAllowed = new Set(allowedRoles);
  if (normalizedAllowed.has('staff') || normalizedAllowed.has('teacher')) {
    normalizedAllowed.add('staff');
    normalizedAllowed.add('teacher');
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive',
      });
    }

    if (!normalizedAllowed.has(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to perform this action',
      });
    }

    next();
  };
};

module.exports = requireRole;
