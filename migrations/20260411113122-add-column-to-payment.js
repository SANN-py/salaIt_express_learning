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

    await queryInterface.changeColumn(
      "Payments",
      "status",
      {
        type: Sequelize.STRING,
        defaultValue: "PENDING",
        allowNull: false,
      },
      "paidAt",
      {
        type: Sequelize.DATE,
        allowNull: true,
      },
      "abaPayWayTransId",
      {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      "orderId",
      {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Payments", "paidAt");
    await queryInterface.changeColumn("Payments", "status", "orderId");
  },
};
