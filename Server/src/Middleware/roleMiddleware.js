// Middleware/roleMiddleware.js

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        msg: "Not authorized - user missing in request",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        msg: `User role '${req.user.role}' is not permitted to access this resource`,
      });
    }

    next();
  };
};
