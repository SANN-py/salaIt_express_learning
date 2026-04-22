"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Update each category with an icon
    await queryInterface.bulkUpdate(
      "Categories",
      { icon: "💻" },
      { name: "Laptop" },
    );

    await queryInterface.bulkUpdate(
      "Categories",
      { icon: "🚗" },
      { name: "Car" },
    );

    await queryInterface.bulkUpdate(
      "Categories",
      { icon: "💍" },
      { name: "Wife" },
    );

    await queryInterface.bulkUpdate(
      "Categories",
      { icon: "🎧" },
      { name: "Accessories" },
    );

    await queryInterface.bulkUpdate(
      "Categories",
      { icon: "📦" },
      { name: "new-category-1" },
    );

    await queryInterface.bulkUpdate(
      "Categories",
      { icon: "📦" },
      { name: "new-category-2" },
    );

    await queryInterface.bulkUpdate(
      "Categories",
      { icon: "👤" },
      { name: "Velma Pearson" },
    );

    await queryInterface.bulkUpdate(
      "Categories",
      { icon: "👤" },
      { name: "Laura Hart" },
    );
  },

  async down(queryInterface, Sequelize) {
    // rollback (remove icons)
    await queryInterface.bulkUpdate("Categories", { icon: null }, {});
  },
};
