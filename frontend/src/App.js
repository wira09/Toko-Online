import React, { useState, useEffect } from "react";
import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";
import ErrorBoundary from "./ErrorBoundary";

function App() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [refresh]);

  const fetchProducts = async () => {
    const res = await fetch("http://localhost:5000/api/products");
    const data = await res.json();
    setProducts(data);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleRefresh = () => {
    setRefresh((prev) => !prev);
    setEditingProduct(null);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Toko Online Sederhana
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            <ProductForm
              editingProduct={editingProduct}
              onCancelEdit={handleCancelEdit}
              onRefresh={handleRefresh}
            />
            <ProductList
              products={products}
              onEdit={handleEdit}
              onRefresh={handleRefresh}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
