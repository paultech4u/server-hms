import jwt from "jsonwebtoken";
import { error } from "../../util/error";

// TODO check if user is authenticated
const { JWT_API_KEY } = process.env;
export const isAuth = async (req, res, next) => {
  const authheader = req.get("Authorization");
  if (!authheader) {
    error(401, "Not authenticated");
  }
  const token = await authheader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, JWT_API_KEY, (err, decoded) => {
      if (err) {
        res.status(406).json({
          message: err.message,
        });
      }
      decoded;
    });
  } catch (error) {
    error.status = 500;
    throw error;
  }
  if (!decodedToken) {
    error(400, "Not authenticated");
  }
  req.userId = decodedToken._id;
  next();
};
