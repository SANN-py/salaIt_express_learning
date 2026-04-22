const app = require("express");
const router = app.Router();
const { Category, Product } = require("../../models");
const { Model, Op, where } = require("sequelize");

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const isExist = await Category.findOne({ where: { name } });
    if (isExist) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }
    const category = await Category.create({
      name,
      isActive: true,
    });
    res.json({
      message: "category create successfuly",
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.get("/list", async (req, res) => {
  const categories = await Category.findAll();
  res.json({
    message: "Category fetch successfuly",
    data: categories,
  });
});
router.get("/", async (req, res) => {
  try {
    // add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const categoryId = req.query.categoryId;
    const offset = (page - 1) * limit;
    let whereCondition = {};
    if (search) {
      whereCondition.name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const { rows: categories, count: total } = await Category.findAndCountAll({
      where: whereCondition,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });
    const totalPage = Math.ceil(total / limit);

    res.status(200).json({
      message: "get all products successfuly",
      data: categories,
      pagination: {
        currentPage: page,
        limit,
        total,
        nextPage: page < totalPage ? page + 1 : null,
        prePage: page > 1 ? page - 1 : null,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
});
router.put("/:categoryId", async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const { categoryId } = req.params;
    const categories = await Category.findByPk(categoryId);
    if (!categories) {
      return res.status(404).json({
        message: `category id: ${categoryId} not found`,
      });
    }
    const update = await categories.update({
      name,
      isActive,
    });
    console.log("update", update);
    res.json({
      message: "update category successfuly",
      data: update,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
});
router.delete("/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const categories = await Category.findByPk(categoryId);
    if (!categories) {
      return res.status(404).json({
        message: `category id: ${categoryId} not found`,
      });
    }
    const kill = await categories.destroy();
    console.log("update", kill);
    res.json({
      message: "update category successfuly",
      data: kill,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
});
module.exports = router;
