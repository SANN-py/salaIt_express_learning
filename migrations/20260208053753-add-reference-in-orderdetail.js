"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn("OrderDetails", "orderId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Orders",
        key: "id",
      },
    });
    await queryInterface.changeColumn("OrderDetails", "productId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn("OrderDetails", "orderId", {
      type: Sequelize.INTEGER,
    });

    await queryInterface.changeColumn("OrderDetails", "productId", {
      type: Sequelize.INTEGER,
    });
  },
};
