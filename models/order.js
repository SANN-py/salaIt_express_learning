"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.belongsTo(models.Customer, {
        foreignKey: "customerId",
        as: "customer",
      });
      Order.hasMany(models.OrderDetail, {
        foreignKey: "orderId",
        as: "orderDetails",
      });
      Order.hasMany(models.Payment, {
        foreignKey: "orderId",
      });
    }
  }
  Order.init(
    {
      orderNumber: DataTypes.INTEGER,
      orderDate: DataTypes.DATE,
      customerId: DataTypes.INTEGER,
      total: DataTypes.DECIMAL(10, 2),
      discount: DataTypes.DECIMAL(10, 2),
    },
    {
      sequelize,
      modelName: "Order",
    },
  );
  return Order;
};
