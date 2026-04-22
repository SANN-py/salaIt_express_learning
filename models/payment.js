"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Payment.belongsTo(models.Order, {
        foreignKey: "orderId",
      });
    }
  }
  Payment.init(
    {
      method: DataTypes.STRING,
      orderId: DataTypes.INTEGER,
      paidAt: DataTypes.STRING,
      status: DataTypes.STRING,
      abaPayWayTransId: DataTypes.STRING,
      amount: DataTypes.DECIMAL(10, 2),
      remark: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Payment",
    },
  );
  return Payment;
};
