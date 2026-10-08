// Signs a JWT that embeds the user's id and role so middleware can enforce
// role-based access (student vs admin) without a second database lookup.
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
