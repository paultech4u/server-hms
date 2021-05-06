const jwt = jest.createMockFromModule("jsonwebtoken");
jwt.verify = (token, secret) => {
  return { _id: "abc" };
};

export default jwt;
