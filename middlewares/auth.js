const jwt = require("jsonwebtoken");
const SECRET = "my-vue-jwt-secret";

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "인증 토큰이 없습니다." });

  const token = authHeader.split("")[1];
  try {
    const decoded = jwt.verify(token, SECRET); // {username}
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
  }
};
