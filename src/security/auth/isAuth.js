import jwt from "jsonwebtoken";
import { User } from "../../model/user";

// TODO check if user is authenticated
const { JWT_SECRET_KEY } = process.env;
export const isAuth = async (req, res, next) => {
  const authheader = req.get("Authorization");
  if (!authheader) {
    return res.status(401).json({
      message: "NOT_AUTHENTICATED",
    });
  }
  const token = await authheader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(406).json({
          message: err.message,
        });
      }
      return decoded;
    });
  } catch (error) {
    error.status = 500;
    throw error;
  }
  if (!decodedToken) {
    return res.status(401).json({
      message: "NOT_AUTHENTICATED",
    });
  }
  const user = User.findById(decodedToken._id);
  if (!user) {
    return res.status(401).json({
      message: "USER_DO_NOT_EXIST",
    });
  }
  if (user) {
    if (user.isActive === false) {
      return res.status(401).json({
        message: "NOT_AUTHENTICATED",
      });
    } else {
      req.userId = decodedToken._id;
    }
  }
  next();
};
