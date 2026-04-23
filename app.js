const express = require("express");
require("dotenv").config();
const app = express();
const port = 3000;
const cors = require("cors");

// connect route
const userRoute = require("./src/routes/user");
const authRoute = require("./src/routes/auth");
const categoryRoute = require("./src/routes/category");
const productRoute = require("./src/routes/product");
const orderRoute = require("./src/routes/order");
const customerRoute = require("./src/routes/customer");
const productImages = require("./src/routes/productFile");
const paymentRoute = require("./src/routes/payment");
const authMiddleware = require("./src/middlewares/authMiddleware");
const fileUpload = require("express-fileupload");
const path = require("path");
app.use(express.json());
app.use(fileUpload());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// use route
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/products", productImages);
app.use("/api/v1/categories", categoryRoute);
app.use("/api/v1/orders", orderRoute);
app.use("/api/v1/customers", customerRoute);
app.use("/api/v1/payments", paymentRoute);

//check live backend
app.get("/api/v1/health", (req, res) => {
  res.json({
    message: "OK",
  });
});

// listen to port
app.listen(port, () => {
  console.log(`listen to port ${port}`);
});
