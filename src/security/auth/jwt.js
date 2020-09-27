import jwt from "jsonwebtoken";
import { error } from "../../util/error";

const { JWT_SECRET_KEY, JWT_REFRESH_SECRET_KEY } = process.env;

export const signAccessToken = (userId, payload) => {
  try {
    const accessToken = jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: "10m",
      audience: userId.toString(),
    });
    return accessToken;
  } catch (err) {
    error(422, "UNPROCCESSABLE_ENTITY");
  }
};

export const verifyAccessToken = (token) => {
  try {
    const accessToken = jwt.verify(token, JWT_SECRET_KEY);
    return accessToken;
  } catch (error) {
    error(406, "TOKEN_EXPIRED");
  }
};

export const signRefreshToken = (userId, payload) => {
  try {
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET_KEY, {
      expiresIn: "7d",
      audience: userId.toString(),
    });
    return refreshToken;
  } catch (error) {
    error(422, "UNPROCCESSABLE_ENTITY");
  }
};

export const verifyRefreshToken = (refreshToken) => {
  try {
    const decodedToken = jwt.verify(refreshToken, JWT_REFRESH_SECRET_KEY);
    const userId = decodedToken.aud;
    return userId;
  } catch (error) {
    error(422, "UNPROCCESSABLE_ENTITY");
  }
};
