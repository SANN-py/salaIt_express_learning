const fs = require("fs");
const path = require("path");
const Pizzip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const dayjs = require("dayjs");
const OrderDetail = require("../../models");

const generateDoc = (order) => {
  const templatePath = path.join(__dirname, "../template/invoice-docx.docx");
  const content = fs.readFileSync(templatePath, "binary");
  const zip = new Pizzip(content);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
  doc.render({
    orderNumber: order.orderNumber,
    orderDate: dayjs(order.orderDate).format("DD-MM-YYYY"),
    firstName: order.customer.firstName,
    lastName: order.customer.lastName,
    discount: order.discount,
    total: order.total,
    items: order.orderDetails,
  });
  const buffer = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });
  return buffer;
};

module.exports = generateDoc;
