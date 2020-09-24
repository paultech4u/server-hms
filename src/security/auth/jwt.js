import jwt from "jsonwebtoken";
// import _ from "loadash";

export const create_token = async (USER, JWT_API_KEY) => {
  const token = jwt.sign(USER, JWT_API_KEY, { expiresIn: "10m" });
  return token;
};
