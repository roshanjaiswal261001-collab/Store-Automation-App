
import { useEffect, useState } from "react";

import {
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  X,
  History
} from "lucide-react";

import { initialProducts } from "../data/products";

function Inventory() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("smartstore_products");

    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("smartstore_inventory_history");
    return saved ? JSON.parse(saved) : [];
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [form, setForm] = useState({
    type: "Stock In",
    quantity: "",
    note: ""
  });

  // Save product and inventory history data
  useEffect(() => {
    localStorage.setItem(
      "smartstore_products",
      JSON.stringify(products)
    );
  }, [products]);

  useEffect(() => {
    localStorage.setItem(
      "smartstore_inventory_history",
      JSON.stringify(history)
    );
  }, [history]);

  // Inventory calculations
  const totalProducts = products.length;

  const totalUnits = products.reduce(
    (total, product) => total + Number(product.quantity),
    0
  );

  const lowStock = products.filter(
    (product) => Number(product.quantity) <= 5
  ).length;

  const outOfStock = products.filter(
    (product) => Number(product.quantity) === 0
  ).length;

  // Search and filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());

    const quantity = Number(product.quantity);

    const matchesFilter =
      filter === "All" ||
      (filter === "In Stock" && quantity > 5) ||
      (filter === "Low Stock" && quantity > 0 && quantity <= 5) ||
      (filter === "Out of Stock" && quantity === 0);

    return matchesSearch && matchesFilter;
  });

  // Open stock update modal
  const openModal = (product, type) => {
    setSelectedProduct(product);

    setForm({
      type: type,
      quantity: "",
      note: ""
    });

    setShowModal(true);
  };

  // Update stock
  const handleSubmit = (e) => {
    e.preventDefault();

    const amount = Number(form.quantity);

    if (!Number.isInteger(amount) || amount <= 0) {
      alert("Please enter a valid positive whole number.");
      return;
    }

    const currentProduct = products.find(
      (product) => product.id === selectedProduct.id
    );

    if (!currentProduct) {
      alert("Product not found.");
      return;
    }

    const currentStock = Number(currentProduct.quantity);

    if (form.type === "Stock Out" && amount > currentStock) {
      alert("Insufficient stock available.");
      return;
    }

    const updatedQuantity =
      form.type === "Stock In"
        ? currentStock + amount
        : currentStock - amount;

    setProducts((prev) =>
      prev.map((product) =>
        product.id === selectedProduct.id
          ? { ...product, quantity: updatedQuantity }
          : product
      )
    );

    const transaction = {
      id: Date.now(),
      productName: currentProduct.name,
      sku: currentProduct.sku,
      type: form.type,
      quantity: amount,
      date: new Date().toLocaleString("en-IN"),
      note: form.note.trim() || "No remarks",
      remainingStock: updatedQuantity
    };

    setHistory((prev) => [transaction, ...prev]);

    setShowModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="inventory-page">

      {/* Page heading */}

      <div className="page-heading">
        <div>
          <h1>Inventory Management</h1>
          <p>Monitor and manage your store stock.</p>
        </div>

        <span className="today-label">
          Live Stock Overview
        </span>
      </div>

      {/* Summary cards */}

      <div className="inventory-stats">

        <div className="inventory-stat">
          <div className="inventory-stat-icon blue">
            <Package size={22} />
          </div>

          <div>
            <span>Total Products</span>
            <h2>{totalProducts}</h2>
          </div>
        </div>

        <div className="inventory-stat">
          <div className="inventory-stat-icon green">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>Total Stock Units</span>
            <h2>{totalUnits}</h2>
          </div>
        </div>

        <div className="inventory-stat">
          <div className="inventory-stat-icon orange">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Low Stock Items</span>
            <h2>{lowStock}</h2>
          </div>
        </div>

        <div className="inventory-stat">
          <div className="inventory-stat-icon red">
            <TrendingDown size={22} />
          </div>

          <div>
            <span>Out of Stock</span>
            <h2>{outOfStock}</h2>
          </div>
        </div>

      </div>

      {/* Inventory table */}

      <section className="panel inventory-panel">

        <div className="panel-heading">
          <div>
            <h3>Stock Overview</h3>
            <p>Manage product stock levels</p>
          </div>

          <span className="product-count">
            {filteredProducts.length} Products
          </span>
        </div>

        <div className="inventory-toolbar">

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
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Stock</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Available Stock</th>
                <th>Status</th>
                <th>Stock Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const quantity = Number(product.quantity);

                let status = "In Stock";

                if (quantity === 0) {
                  status = "Out of Stock";
                } else if (quantity <= 5) {
                  status = "Low Stock";
                }

                return (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                    </td>

                    <td>{product.sku}</td>

                    <td>{product.category}</td>

                    <td>
                      <strong>{quantity} units</strong>
                    </td>

                    <td>
                      <span
                        className={
                          status === "In Stock"
                            ? "status in-stock"
                            : status === "Low Stock"
                            ? "status low-stock"
                            : "status out-stock"
                        }
                      >
                        {status}
                      </span>
                    </td>

                    <td>
                      <div className="stock-actions">

                        <button
                          className="stock-in-btn"
                          onClick={() =>
                            openModal(product, "Stock In")
                          }
                        >
                          <Plus size={14} />
                          In
                        </button>

                        <button
                          className="stock-out-btn"
                          onClick={() =>
                            openModal(product, "Stock Out")
                          }
                          disabled={quantity === 0}
                        >
                          <TrendingDown size={14} />
                          Out
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-message">
                    No inventory products found.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </section>

      {/* Inventory history */}

      <section className="panel inventory-history">

        <div className="panel-heading">
          <div>
            <h3>
              <History size={18} className="inline-icon" />
              Inventory History
            </h3>
            <p>Recent stock transactions</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Remaining Stock</th>
                <th>Date</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {history.slice(0, 10).map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.productName}</strong>
                  </td>

                  <td>
                    <span
                      className={
                        item.type === "Stock In"
                          ? "status in-stock"
                          : "status low-stock"
                      }
                    >
                      {item.type}
                    </span>
                  </td>

                  <td>{item.quantity} units</td>

                  <td>{item.remainingStock} units</td>

                  <td>{item.date}</td>

                  <td>{item.note}</td>
                </tr>
              ))}

              {history.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-message">
                    No inventory transactions yet.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </section>

      {/* Stock update modal */}

      {showModal && selectedProduct && (
        <div className="modal-overlay">

          <div className="product-modal">

            <div className="modal-heading">
              <div>
                <h2>{form.type}</h2>
                <p>
                  Update stock for {selectedProduct.name}
                </p>
              </div>

              <button
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <label>Product Name</label>

              <input
                value={selectedProduct.name}
                disabled
              />

              <label>Current Stock</label>

              <input
                value={`${selectedProduct.quantity} units`}
                disabled
              />

              <label>Transaction Type</label>

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value
                  })
                }
              >
                <option value="Stock In">Stock In</option>
                <option value="Stock Out">Stock Out</option>
              </select>

              <label>Quantity</label>

              <input
                type="number"
                placeholder="Enter quantity"
                min="1"
                step="1"
                value={form.quantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    quantity: e.target.value
                  })
                }
                required
              />

              <label>Remarks (Optional)</label>

              <input
                type="text"
                placeholder="Enter transaction remarks"
                value={form.note}
                onChange={(e) =>
                  setForm({
                    ...form,
                    note: e.target.value
                  })
                }
              />

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Confirm {form.type}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Inventory;
