const app = require("express");
const router = app.Router();
const { Customer } = require("../../models");
const bcrypt = require("bcryptjs");

router.post("/create", async (req, res) => {
  try {
    const { firstName, lastName, username, password, phone, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const exist = await Customer.findOne({ where: { username } });
    if (exist) {
      return res.status(409).json({ message: "Username already exists" });
    }
    const customer = await Customer.create({
      firstName,
      lastName,
      username,
      password: hashedPassword,
      phone,
      email,
    });
    res.json({
      message: "customer create successfuly",
      data: customer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
});

module.exports = router;
