const app = require("express");
const router = app.Router();
const bcrypt = require("bcryptjs");
const { User } = require("../../models");

router.put("/:userId", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      phoneNumber,
      password,
      isActive,
      userName,
    } = req.body;
    const userId = req.params.userId;
    let user = await User.findByPk(userId);
    let hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : user.password;

    if (!user) {
      return res.status(404).json({ message: `user id: ${userId} not found` });
    }
    user = await user.update({
      firstName,
      lastName,
      gender,
      userName,
      phoneNumber,
      password: hashedPassword,
      isActive,
    });
    res.json({
      message: "user update successfuly",
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
});

router.delete("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    let user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: `user id: ${userId} not found` });
    }
    user = await user.destroy();
    res.json({
      message: "delete user successfuly",
      data: user,
    });
  } catch (error) {}
});

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: `user id: ${userId} not found` });
    }
    res.json({
      message: "get user by id successfuly",
      data: user,
    });
  } catch (error) {}
});
router.get("/", async (req, res) => {
  const user = await User.findAll();
  res.json({
    message: "get all users successfuly",
    data: user,
  });
});
module.exports = router;
