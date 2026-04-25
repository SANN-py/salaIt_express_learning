const app = require("express");
const router = app.Router();
const { Product, ProductImages } = require("../../models");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const { where } = require("sequelize");
const { storage } = require("../storage/storage");
const multer = require("multer");
const upload = multer({ storage });

router.post("/upload/:productId/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const productId = req.params.productId;
    const product = await Product.findByPk(productId);
    // if (!req.files || !req.files.file) {
    //   return res.status(400).json({
    //     message: "no file uploaded",
    //   });
    // }
    // const file = req.files.file;
    if (!product) {
      return res.status(404).json({
        message: `product id: ${productId} not found`,
      });
    }
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }
    // const fileName = `${uuidv4()}${path.extname(file.name)}`;
    const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
    // const uploadPath = path.join(process.cwd(), "uploads/products", fileName);
    // await file.mv(uploadPath);
    // const domain = `${req.protocol}://${req.get("host")}`;
    // const imageUrl = `${domain}/uploads/products/${fileName}`;
    const savedImage = await ProductImages.create({
      productId,
      // imageUrl,
      imageUrl: file.path,
      fileName: file.name,
      // fileName,
    });
    res.status(200).json({
      message: "upload image successfuly",
      data: savedImage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
});

router.get("/download/:imageId/", async (req, res) => {
  try {
    const { imageId } = req.params;
    const image = await ProductImages.findByPk(imageId);
    if (!image) {
      return res.status(404).json({
        message: `product image with id: ${imageId} not found`,
      });
    }
    const fileName = image.imageUrl.split("/").pop();
    // const filePath = path.join(process.cwd(), "uploads/products", fileName);
    if (!fs.existsSync(filePath)) {
      return res.json({
        message: `file not found on server`,
      });
    }
    res.status(200).download(filePath, image.fileName);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "internal server error",
    });
  }
});

router.delete("/images/:id", async (req, res) => {
  const { id } = req.params;
  const image = await ProductImages.findOne({
    where: {
      id,
    },
  });
  if (!image) {
    return res(404).json({
      message: `product image with ${id} not found`,
    });
  }
  // remove image from server folder uploads
  const fileName = image.imageUrl.split("/").pop();
  const filePath = path.join(process.cwd(), "uploads/products", fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  // remove data from database
  await image.destroy();
  return res.json({
    message: `product image ${id} deleteted successfuly`,
  });
});

module.exports = router;
