"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
      });
      Product.hasMany(models.ProductImages, {
        foreignKey: "productId",
        as: "productImages",
      });
    }
  }
  Product.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      color: DataTypes.STRING,
      qty: DataTypes.INTEGER,
      categoryId: DataTypes.INTEGER,
      isActive: DataTypes.BOOLEAN,
      price: DataTypes.DECIMAL(10, 2),
    },
    {
      sequelize,
      modelName: "Product",
    },
  );
  return Product;
};
