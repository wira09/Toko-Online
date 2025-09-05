import React, { useState, useEffect } from "react";

function ProductForm({ editingProduct, onCancelEdit, onRefresh }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = !!editingProduct;

  // Update form fields when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || "");
      setDescription(editingProduct.description || "");
      setPrice(editingProduct.price || "");
    } else {
      // Reset form when not editing
      setName("");
      setDescription("");
      setPrice("");
      setImage(null);
    }
  }, [editingProduct]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      setError("Nama dan harga wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    if (image) formData.append("image", image);

    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `http://localhost:5000/api/products/${editingProduct.id}`
        : "http://localhost:5000/api/products";

      const res = await fetch(url, { method, body: formData });

      if (res.ok) {
        onRefresh();
        // Reset form setelah berhasil menyimpan
        setName("");
        setDescription("");
        setPrice("");
        setImage(null);
      } else {
        const data = await res.json();
        setError(data.message || data.error || "Gagal menyimpan produk");
      }
    } catch (err) {
      setError("Kesalahan jaringan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? "Edit Produk" : "Tambah Produk Baru"}
      </h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nama
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Deskripsi
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows="3"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Harga (Rp)
          </label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Gambar
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full"
          />
          {isEditing && editingProduct.image && (
            <img
              src={`http://localhost:5000${editingProduct.image}`}
              alt="current"
              className="mt-2 h-20 object-cover"
            />
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : isEditing ? "Update" : "Simpan"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Batal
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
