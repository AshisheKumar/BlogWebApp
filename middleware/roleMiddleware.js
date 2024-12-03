const roleMiddleware = (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).send({ error: 'Authentication required' });
      }
  
      if (!roles.includes(req.user.role)) {
        return res.status(403).send({ error: 'Access denied' });
      }
  
      next();
    };
  };
  
  module.exports = roleMiddleware;