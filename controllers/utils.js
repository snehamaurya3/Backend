const jwt = require("jsonwebtoken");

exports.generateToken = (id, role, jti) => {
  return jwt.sign({ id, role, jti }, process.env.JWT_SECRET, { expiresIn: "12h" });
};



//jti stands for JWT ID