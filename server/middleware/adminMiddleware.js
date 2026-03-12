const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

const admin = adminMiddleware;

module.exports = adminMiddleware;
module.exports.admin = admin;
