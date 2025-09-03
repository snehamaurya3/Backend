const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

exports.protect = (role) => {
  return async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      try {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let currentUser;
        if (role === "user") {
          currentUser = await User.findById(decoded.id);
        } else if (role === "admin") {
          currentUser = await Admin.findById(decoded.id);
        }

        if (!currentUser || currentUser.activeSession !== decoded.jti) {
          return res.status(401).json({ msg: "Invalid or expired session" });
        }

        req.user = currentUser;
        next();
      } catch (err) {
        return res.status(401).json({ msg: "Not authorized" });
      }
    } else {
      return res.status(401).json({ msg: "No token provided" });
    }
  };
};
