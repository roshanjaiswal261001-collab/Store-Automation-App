
import { useEffect, useState } from "react";
import {
  Truck,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Building2,
  Package,
  Phone,
  Mail,
} from "lucide-react";

function getStoredData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function Suppliers() {
  const [suppliers, setSuppliers] = useState(() =>
    getStoredData("smartstore_suppliers", [])
  );

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    company: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    products: "",
  });

  useEffect(() => {
    localStorage.setItem(
      "smartstore_suppliers",
      JSON.stringify(suppliers)
    );
  }, [suppliers]);

  const filteredSuppliers = suppliers.filter((supplier) => {
    const value = search.toLowerCase();

    return (
      supplier.company.toLowerCase().includes(value) ||
      supplier.name.toLowerCase().includes(value) ||
      supplier.phone.toLowerCase().includes(value) ||
      supplier.email.toLowerCase().includes(value) ||
      supplier.products.toLowerCase().includes(value)
    );
  });

  function openAddModal() {
    setEditingSupplier(null);

    setFormData({
      company: "",
      name: "",
      phone: "",
      email: "",
      address: "",
      products: "",
    });

    setShowModal(true);
  }

  function openEditModal(supplier) {
    setEditingSupplier(supplier);

    setFormData({
      company: supplier.company,
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      products: supplier.products,
    });

    setShowModal(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function saveSupplier(e) {
    e.preventDefault();

    const company = formData.company.trim();
    const name = formData.name.trim();
    const phone = formData.phone.trim();

    if (!company || !name || !phone) {
      alert("Please fill in all required fields.");
      return;
    }

    const duplicate = suppliers.some(
      (supplier) =>
        supplier.phone.replace(/\D/g, "") === phone.replace(/\D/g, "") &&
        supplier.id !== editingSupplier?.id
    );

    if (duplicate) {
      alert("A supplier with this phone number already exists.");
      return;
    }

    const supplierData = {
      ...formData,
      company,
      name,
      phone,
      email: formData.email.trim(),
      address: formData.address.trim(),
      products: formData.products.trim(),
    };

    if (editingSupplier) {
      setSuppliers((current) =>
        current.map((supplier) =>
          supplier.id === editingSupplier.id
            ? { ...supplier, ...supplierData }
            : supplier
        )
      );
    } else {
      const newSupplier = {
        id: Date.now(),
        ...supplierData,
        createdAt: new Date().toLocaleDateString("en-IN"),
      };

      setSuppliers((current) => [newSupplier, ...current]);
    }

    setShowModal(false);
  }

  function deleteSupplier(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (confirmed) {
      setSuppliers((current) =>
        current.filter((supplier) => supplier.id !== id)
      );
    }
  }

  return (
    <div className="suppliers-page">
      <div className="page-heading">
        <div>
          <h1>Supplier Management</h1>
          <p>Manage your store suppliers and their product details.</p>
        </div>

        <button className="add-supplier-btn" onClick={openAddModal}>
          <Plus size={18} />
          Add Supplier
        </button>
      </div>

      {/* Supplier Statistics */}
      <div className="supplier-stats">
        <div className="supplier-stat-card">
          <div className="supplier-stat-icon blue">
            <Truck size={22} />
          </div>
          <div>
            <p>Total Suppliers</p>
            <h2>{suppliers.length}</h2>
          </div>
        </div>

        <div className="supplier-stat-card">
          <div className="supplier-stat-icon green">
            <Building2 size={22} />
          </div>
          <div>
            <p>Total Companies</p>
            <h2>
              {new Set(
                suppliers.map((supplier) =>
                  supplier.company.toLowerCase()
                )
              ).size}
            </h2>
          </div>
        </div>

        <div className="supplier-stat-card">
          <div className="supplier-stat-icon purple">
            <Package size={22} />
          </div>
          <div>
            <p>Supplied Product Entries</p>
            <h2>
              {suppliers.filter((supplier) => supplier.products.trim()).length}
            </h2>
          </div>
        </div>
      </div>

      {/* Supplier List */}
      <div className="supplier-list-container">
        <div className="supplier-toolbar">
          <h2>All Suppliers</h2>

          <div className="supplier-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search supplier, company or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="supplier-grid">
          {filteredSuppliers.map((supplier) => (
            <div className="supplier-card" key={supplier.id}>
              <div className="supplier-card-header">
                <div className="supplier-company-icon">
                  <Building2 size={23} />
                </div>

                <div className="supplier-card-actions">
                  <button
                    className="edit-supplier"
                    title="Edit supplier"
                    onClick={() => openEditModal(supplier)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="delete-supplier"
                    title="Delete supplier"
                    onClick={() => deleteSupplier(supplier.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3>{supplier.company}</h3>
              <p className="supplier-contact-name">{supplier.name}</p>

              <div className="supplier-contact-details">
                <p>
                  <Phone size={15} />
                  {supplier.phone}
                </p>

                <p>
                  <Mail size={15} />
                  {supplier.email || "Email not provided"}
                </p>
              </div>

              <div className="supplier-products">
                <strong>Supplied Products</strong>
                <p>{supplier.products || "No products added"}</p>
              </div>

              <div className="supplier-address">
                <span>Address</span>
                <p>{supplier.address || "Address not provided"}</p>
              </div>
            </div>
          ))}

          {filteredSuppliers.length === 0 && (
            <div className="supplier-empty">
              <Truck size={35} />
              <h3>No suppliers found</h3>
              <p>
                {search
                  ? "Try searching with another keyword."
                  : "Click Add Supplier to create your first supplier."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Supplier Modal */}
      {showModal && (
        <div className="supplier-modal-overlay">
          <div className="supplier-modal">
            <div className="supplier-modal-header">
              <div>
                <h2>
                  {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
                </h2>
                <p>Enter supplier and company information.</p>
              </div>

              <button
                className="supplier-close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveSupplier}>
              <div className="supplier-form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="company"
                  placeholder="Enter company name"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="supplier-form-group">
                <label>Contact Person *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter contact person name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="supplier-form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="supplier-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="supplier-form-group">
                <label>Supplied Products</label>
                <input
                  type="text"
                  name="products"
                  placeholder="Example: Rice, Oil, Sugar"
                  value={formData.products}
                  onChange={handleChange}
                />
              </div>

              <div className="supplier-form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  placeholder="Enter company address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="supplier-modal-actions">
                <button
                  type="button"
                  className="supplier-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="supplier-save-btn">
                  {editingSupplier ? "Update Supplier" : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Suppliers;
