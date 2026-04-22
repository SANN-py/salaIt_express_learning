const app = require("express");
const router = app.Router();
const { Customer, Product, Order, OrderDetail } = require("../../models");
const generateDoc = require("../utils/generateOrderDoc");
const { or } = require("sequelize");

router.post("/create", async (req, res) => {
  try {
    const { customerId, items, discount } = req.body;
    const WALK_IN_CUSTOMER_ID = 2;
    const finalCustomerId = customerId || WALK_IN_CUSTOMER_ID;
    const customer = await Customer.findByPk(finalCustomerId);
    if (!customer) {
      return res.status(404).json({
        message: `customer id: ${finalCustomerId} not found`,
      });
    }
    const orderDetails = [];
    let totalAmount = 0;
    // item req as array from user
    for (const item of items) {
      const { productId, qty } = item;
      // get product info
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          message: `product id: ${productId} not found`,
        });
      }
      const amount = parseFloat(product.price) * qty;
      totalAmount += amount;
      orderDetails.push({
        productId,
        productName: product.name,
        productPrice: parseFloat(product.price),
        qty,
        amount,
      });
    }

    const orderNumber = generateInvoiceNumber();
    // create order in db
    const createOrder = await Order.create({
      customerId: WALK_IN_CUSTOMER_ID || customerId,
      orderNumber: orderNumber,
      discount: discount,
      total: totalAmount,
      orderDate: new Date(),
      location: customer.location,
    });
    // create orderDetails in db
    const createOrderDetail = orderDetails.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productPrice: item.productPrice,
      qty: item.qty,
      amount: item.amount,
      orderId: createOrder.id,
    }));
    await OrderDetail.bulkCreate(createOrderDetail);
    const orderCompleted = await Order.findByPk(createOrder.id, {
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: { exclude: ["password"] },
        },
        {
          model: OrderDetail,
          as: "orderDetails",
        },
      ],
    });
    res.json({
      message: "create order successfuly",
      data: orderCompleted,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
});
router.get("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: { exclude: ["password"] },
        },
        {
          model: OrderDetail,
          as: "orderDetails",
        },
      ],
    });
    if (!order) {
      return res.status(404).json({
        message: `order id: ${orderId} not found`,
      });
    }
    res.json({
      message: `get Order id: ${orderId} successfully`,
      data: order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
});
router.delete("/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order first
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ message: `Order id: ${orderId} not found` });
    }

    // Delete related order details
    await OrderDetail.destroy({ where: { orderId } });

    // Delete the order itself
    await Order.destroy({ where: { id: orderId } });

    res.json({
      message: `Order id: ${orderId} deleted successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
});
router.get("/generate-doc/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: Customer,
          as: "customer",
        },
        {
          model: OrderDetail,
          as: "orderDetails",
        },
      ],
    });
    const buffer = generateDoc(order);
    res
      .status(200)
      .setHeader(
        "Content-Disposition",
        `attachment;filename=order${order.orderNumber}.docx`,
      );
    res
      .status(200)
      .setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
    res.status(200).send(buffer);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
});
router.get("/", async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: {
        model: Customer,
        as: "customer",
        attributes: [
          "id",
          "firstName",
          "lastName",
          "username",
          "phone",
          "email",
          "location",
        ],
      },
    });
    res.status(200).json({
      message: "orders data",
      data: orders,
    });
  } catch (error) {}
});

function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  return `ORD-${year}${month}${day}-${hours}${minutes}${second}`;
}
module.exports = router;
