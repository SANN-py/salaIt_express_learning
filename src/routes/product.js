const app = require("express");
const router = app.Router();

const { Product, Category, ProductImages } = require("../../models");
const { Model, Op, where } = require("sequelize");

router.post("/", async (req, res) => {
  try {
    const { name, description, color, qty, categoryId, price, isActive } =
      req.body;
    const product = await Product.create({
      name,
      description,
      color,
      qty,
      categoryId,
      price,
      isActive,
    });
    res.status(200).json({
      message: "create product successfuly",
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
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
    if (categoryId) {
      whereCondition.categoryId = {
        [Op.eq]: categoryId,
      };
    }
    const { rows: products, count: total } = await Product.findAndCountAll({
      where: whereCondition,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Category, // table name
          as: "category",
        },
        {
          model: ProductImages, // table name
          as: "productImages",
          attributes: ["id", "productId", "imageUrl", "fileName"],
        },
      ],
    });
    const totalPage = Math.ceil(total / limit);

    res.status(200).json({
      message: "get all products successfuly",
      data: products,
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
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });
    if (!product) {
      return res.status(404).json({
        message: `product id: ${productId} not found`,
      });
    }
    res.status(200).json({
      message: "get product by id successfuly",
      data: product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
});

router.put("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, color, qty, categoryId, isActive, price } =
      req.body;
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        message: `product id: ${productId} not found`,
      });
    }
    const update = await product.update({
      name,
      description,
      color,
      qty,
      categoryId,
      isActive,
      price,
    });

    const products = await Product.findByPk(productId, {
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });
    res.json({
      message: "update product successfuly",
      data: products,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
});
router.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        message: `product id: ${productId} not found`,
      });
    }
    const kill = await product.destroy();
    res.json({
      message: "delete product successfuly",
      data: kill,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
});

module.exports = router;
