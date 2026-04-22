const app = require("express");
const router = app.Router();
const { Payment, Customer, Order, OrderDetail } = require("../../models");
const { where, json } = require("sequelize");
const {
  getReqTime,
  encodeBase64,
  buildPurchaseHash,
  buildCheckTransactionHash,
} = require("../utils/payway");
const axios = require("axios");

router.post("/:orderId", async (req, res) => {
  console.log("env work", process.env.FRONTEND_URL);
  try {
    //fetch order
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, {
      include: [
        { model: Customer, as: "customer" },
        { model: OrderDetail, as: "orderDetails" },
      ],
    });
    if (!order) {
      return res.status(404).json({
        message: `order id ${orderId} not found`,
      });
    }
    console.log("order", order);

    //check if the payment has been create before
    let payment = await Payment.findOne({
      where: { orderId, status: "PENDING" },
    });
    //create payment
    let paywayTranId = `ORD-${Date.now()}`;

    payment = await Payment.create({
      orderId: order.id,
      method: "ABA PAYWAY",
      status: "PENDING",
      abaPayWayTransId: paywayTranId,
      amount: order.total,
      remark: "pay_via_aba",
    });
    //prepare hash to aba
    const req_time = getReqTime();
    // console.log("req_time", req_time);
    let payWayItems = JSON.stringify(
      order.orderDetails?.map((detail) => ({
        name: detail.productName,
        quantity: detail.qty,
        price: Number(detail.productPrice),
      })),
    );
    payWayItems = encodeBase64(payWayItems);
    const endcodeReturnUrl = `${process.env.FRONTEND_URL}/admin/pos`;
    const paymentPayload = {
      merchant_id: process.env.ABA_PAYWAY_MERCHANT_ID,
      req_time,
      tran_id: paywayTranId,
      amount: Number(order.total).toFixed(2),
      items: payWayItems,
      shipping: "0.00",
      firstname: order.customer?.name?.split(" ")[0] || "Customer",
      lastname: order.customer?.name?.split(" ").slice(1).join(" ") || "NA",
      email: order.customer?.email || "no-email@example.com",
      phone: order.customer?.phone || "000000000",
      type: "purchase",
      view_type: "popup",
      payment_option: "abapay_khqr",
      return_url: endcodeReturnUrl,
      cancel_url: `${process.env.FRONTEND_URL}/admin/pos`,
      continue_success_url: `${process.env.FRONTEND_URL}/admin/pos?tranId=${paywayTranId}`,
      currency: "USD",
      payment_gate: 0,
    };
    //build hash
    const hash = buildPurchaseHash(paymentPayload);
    return res.status(200).json({
      message: "payment created successfuly",
      data: {
        payment,
        payway: {
          action: `${process.env.ABA_PAYWAY_BASE_URL}/api/payment-gateway/v1/payments/purchase`,
          method: "POST",
          target: "aba_webservice",
          id: "aba_merchant_request",
          field: {
            ...paymentPayload,
            hash,
          },
        },
      },
    });
  } catch (error) {
    console.log("payment error", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/:tranId/check", async (req, res) => {
  try {
    const { tranId } = req.params;
    const payment = await Payment.findOne({
      where: { abaPayWayTransId: tranId },
    });
    console.log("payment", payment);
    if (!payment) {
      return res.status(404).json({
        message: "payment not found",
      });
    }
    // prepare hash for aba
    const req_time = getReqTime();
    const merchant_id = process.env.ABA_PAYWAY_MERCHANT_ID;
    const tran_id = payment.abaPayWayTransId;
    const hash = buildCheckTransactionHash({ req_time, merchant_id, tran_id });
    //prepar api
    const payload = {
      req_time,
      merchant_id,
      tran_id,
      hash,
    };
    const response = await axios.post(
      `${process.env.ABA_PAYWAY_BASE_URL}/api/payment-gateway/v1/payments/check-transaction-2`,
      payload,
    );
    console.log("res from aba", response);
    //study condition to display successful or not
    const abaData = response.data;
    const statusCode = abaData?.status?.code;
    const paymentStatusCode = abaData?.data?.payment_status_code;
    const paymentStatus = abaData?.data?.payment_status;
    if (statusCode == "00") {
      if (paymentStatusCode === 0 && paymentStatus === "APPROVED") {
        payment.status = "PAID";
        payment.paidAt = abaData?.data?.transaction_date;
      } else if (
        paymentStatus === "DECLINED" ||
        paymentStatus === "FAILED" ||
        paymentStatusCode !== 0
      ) {
        payment.status = "FAILED";
      } else {
        payment.status = "PENDING";
      }
      payment.remark = JSON.stringify(abaData);
      await payment.save();
    }
    return res.json({
      message: "payment checked successfully",
      data: {
        payment: payment,
        aba: abaData,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
