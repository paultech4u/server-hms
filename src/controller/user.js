const { validationResult } = require("express-validator");
const User = require("../model/user");

exports.getUser = (req, res, next) => {
  res
    .status(200)
    .json({ user: [{ email: "speak2donsimon@gmail.com", name: "Paulsimon" }] });
};

exports.postUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Invalid");
    error.status = 422;
    throw error;
  }
  const email = req.body.email;
  const name = req.body.name;
  const user = new User({
    email: email,
    name: name,
  });
  user
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        massage: "Successful",
        newuser: result,
      });
    })
    .catch((error) => {
      if (!error.status) {
        error.status = 500;
      }
      next(error);
    });
};
