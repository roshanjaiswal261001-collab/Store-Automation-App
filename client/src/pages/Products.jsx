
import { useEffect, useState } from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  X
} from "lucide-react";

import { initialProducts } from "../data/products";

function Products() {
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem("smartstore_products");

    return savedProducts
      ? JSON.parse(savedProducts)
      : initialProducts;
  });

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const emptyForm = {
    name: "",
    category: "Grocery",
    price: "",
    quantity: "",
    sku: ""
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem(
      "smartstore_products",
      JSON.stringify(products)
    );
  }, [products]);

  const categories = [
    "All",
    "Grocery",
    "Electronics",
    "Clothing",
    "Stationery"
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.sku.trim() ||
      form.price === "" ||
      form.quantity === "" ||
      Number(form.price) <= 0 ||
      Number(form.quantity) < 0
    ) {
      alert("Please enter valid product details.");
      return;
    }

    const skuExists = products.some(
      (product) =>
        product.sku.toLowerCase() === form.sku.trim().toLowerCase() &&
        product.id !== editId
    );

    if (skuExists) {
      alert("This SKU already exists.");
      return;
    }

    if (editId !== null) {
      setProducts((prev) =>
        prev.map((product) =>
          product.id === editId
            ? {
                ...form,
                id: editId,
                name: form.name.trim(),
                sku: form.sku.trim(),
                price: Number(form.price),
                quantity: Number(form.quantity)
              }
            : product
        )
      );
    } else {
      const newProduct = {
        ...form,
        id: Date.now(),
        name: form.name.trim(),
        sku: form.sku.trim(),
        price: Number(form.price),
        quantity: Number(form.quantity)
      };

      setProducts((prev) => [...prev, newProduct]);
    }

    closeForm();
  };

  const handleEdit = (product) => {
    setEditId(product.id);

    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      quantity: String(product.quantity),
      sku: product.sku
    });

    setShowForm(true);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (confirmDelete) {
      setProducts((prev) =>
        prev.filter((product) => product.id !== id)
      );
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  };

  return (
    <div className="products-page">

      <div className="page-heading">
        <div>
          <h1>Products</h1>
          <p>Manage all products in your store.</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="product-summary">
        <div className="product-summary-icon">
          <Package size={23} />
        </div>

        <div>
          <span>Total Products</span>
          <h2>{products.length}</h2>
        </div>
      </div>

      <div className="product-toolbar">
        <div className="product-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search product or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All Categories" : item}
            </option>
          ))}
        </select>
      </div>

      <div className="panel product-table-panel">
        <div className="panel-heading">
          <div>
            <h3>Product List</h3>
            <p>All available products</p>
          </div>

          <span className="product-count">
            {filteredProducts.length} Products
          </span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                  </td>

                  <td>{product.sku}</td>

                  <td>{product.category}</td>

                  <td>
                    ₹{product.price.toLocaleString("en-IN")}
                  </td>

                  <td>{product.quantity}</td>

                  <td>
                    <span
                      className={
                        product.quantity <= 5
                          ? "status low-stock"
                          : "status in-stock"
                      }
                    >
                      {product.quantity <= 5
                        ? "Low Stock"
                        : "In Stock"}
                    </span>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(product)}
                        title="Edit product"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(product.id)}
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-message">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="product-modal">

            <div className="modal-heading">
              <div>
                <h2>
                  {editId !== null
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>

                <p>Enter the product details below.</p>
              </div>

              <button
                className="close-btn"
                onClick={closeForm}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <label>Product Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter product name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <label>SKU</label>
              <input
                type="text"
                name="sku"
                placeholder="Enter product SKU"
                value={form.sku}
                onChange={handleChange}
                required
              />

              <label>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option>Grocery</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Stationery</option>
              </select>

              <div className="form-row">
                <div>
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    placeholder="Quantity"
                    min="0"
                    step="1"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  {editId !== null
                    ? "Update Product"
                    : "Save Product"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Products;
