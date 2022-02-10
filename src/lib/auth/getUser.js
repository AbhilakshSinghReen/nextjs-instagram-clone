const jwt = require("jsonwebtoken");

export default function getUser(req) {
  const authorizationHeader = req.headers.authorization; //.get("authorization");

  if (!authorizationHeader) {
    // No auth header
    return null;
  }

  const authData = authorizationHeader.split(" ");

  if (authData.length < 2) {
    // Improper auth header
    return null;
  }

  const token = authData[1];
  if (!token) {
    // No Bearer token
    return null;
  }

  const user = jwt.verify(token, process.env.JWT_SECRET_KEY);

  if (!user) {
    // Invalid user
    return null;
  }

  // Valid user
  return user;
}
