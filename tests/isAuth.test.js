jest.mock("jsonwebtoken");
import jwt from "jsonwebtoken";
import { isAuth } from "../src/security/auth/authMiddleware";

describe("Authentication middleware", () => {
  test("should throw an error if the authorization header returns null", () => {
    const req = {
      get: function () {
        return null;
      },
    };
    expect(isAuth.bind(this, req, {}, () => {})).toThrow();
  });
  test("should throw an error if the authorization header is only one string", () => {
    const req = {
      get: function () {
        return "abc";
      },
    };
    expect(isAuth.bind(this, req, {}, () => {})).toThrow();
  });
  test("should throw an error if token cannot be verified", () => {
    const req = {
      get: function () {
        return "Bearer abc";
      },
    };
    expect(isAuth.bind(this, req, {}, () => {})).toThrow();
  });
  test("should yield a userId if token as be decoded", () => {
    const req = {
      get: function () {
        return "Bearer abc";
      },
    };
    jwt.verify.mockReturnValue({ _id: "abc" });
    isAuth(req, {}, () => {});
    expect(req).toHaveProperty("userId");
    expect(req).toHaveProperty("userId", "abc");
    jwt.verify.mockRestore();
  });
});
