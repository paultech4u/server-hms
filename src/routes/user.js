const express = require("express");
const { body } = require("express-validator");
const users = require("../controller/user");

const router = express.Router();

router.get("/users", users.getUser);

router.post(
  "/postuser",
  [
    body("email").isEmail().normalizeEmail({ all_lowercase: false }),
    body("name").not().isEmpty().trim(),
  ],
  users.postUser
);

module.exports = router;
