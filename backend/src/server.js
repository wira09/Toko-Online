const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // agar gambar bisa diakses via URL

const fs = require('fs');      // untuk operasi file system
const path = require('path');  // untuk menangani path file

// Setup multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Routes

// GET semua produk
app.get("/api/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET produk by ID
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!product)
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

// PUT update produk
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    // Jika ada gambar baru, hapus gambar lama
    if (image) {
      const oldProduct = await prisma.product.findUnique({
        where: { id: parseInt(id) },
      });

      if (oldProduct && oldProduct.image) {
        const oldImagePath = path.join(__dirname, oldProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log(`Gambar lama ${oldProduct.image} berhasil dihapus`);
        }
      }
    }

    const data = { name, description, price: parseFloat(price) };
    if (image !== undefined) data.image = image;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data,
    });
    res.json(product);
  } catch (err) {
    console.error('Error saat mengupdate produk:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE produk
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Produk dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
