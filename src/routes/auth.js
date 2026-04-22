const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../../models");

router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      userName,
      gender,
      phoneNumber,
      password,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      userName,
      email,
      gender,
      phoneNumber,
      password: hashedPassword,
    });
    res.json({
      message: "create user successfuly",
      data: user,
    });
  } catch (error) {}
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // check is the use exist in db
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: `user ${email} not found` });
    }
    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: `password not correct` });
    }
    // password match
    const token = jwt.sign(
      {
        id: user.id,
        userName: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
      },
      "sann_2026",
      { expiresIn: "1d" },
    );
    res.json({
      message: "login successfully",
      token,
      expiresIn: "1d",
    });
  } catch (error) {}
});

module.exports = router;
