const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Denied access' });
    }
    next();
  };
};

const isOwnerOrAdmin = (req, res, next) => {
const { id } = req.params;
if (req.user.role === 'admin' || req.user.id === id) {
  return next();
}
return res.status(403).json({ message: 'Denied access' });
};

module.exports = { authorizeRole, isOwnerOrAdmin };