/**
 * Role-based access control middleware.
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'student')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`
      });
    }
    next();
  };
};

const requireScanner = (permission) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      const { hackathonId } = req.params;

      if (!user || !user.hackathonRoles) {
        return res
          .status(403)
          .json({ success: false, error: "Scanner permission required" });
      }

      const roleEntry = user.hackathonRoles.find(
        (r) => r.hackathonId.toString() === hackathonId && r.role === "scanner",
      );

      if (!roleEntry || !roleEntry.permissions.includes(permission)) {
        return res
          .status(403)
          .json({ success: false, error: "Scanner permission required" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ success: false, error: "Server Error" });
    }
  };
};

module.exports = { authorize, requireScanner };
