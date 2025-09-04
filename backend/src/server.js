const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// midleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // agar gambar bisa di akses via URL

// setup multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// routes

// get semua produk
app.get("/api/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    req.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get produk by id
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: error.message });
  }
});

// POST tambah produk + upload gambar
app.post("/api/products", upload.single("image"), async (req, res) => {
  const { name, description, price } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
      },
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update produk
app.put("/api/products/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const data = { name, description, price: parseFloat(price) };
    if (image !== undefined) data.image = image;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data,
    });
    req.json(product);
  } catch (err) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE produk
app.delete("/api/products/:id", async (req, res) => {
  const { id } = req;
  try {
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: error.message });
  }
});

// jalankan server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
