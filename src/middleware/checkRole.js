export const checkRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user?.roles) {
      res.status(402).json({ error: "Authorization required" });
    }
    const userRoles = req.user?.roles;
    const hasRequiredRoles = userRoles.some((role) =>
      allowedRoles.includes(role)
    );
    if (hasRequiredRoles) {
      next();
    } else {
      res.status(403).json({ error: "Forbidden: Insufficient permissions." });
    }
  };
};
