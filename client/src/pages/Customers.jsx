
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  X,
  ShoppingBag,
} from "lucide-react";

function getStoredData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function Customers() {
  const [customers, setCustomers] = useState(() =>
    getStoredData("smartstore_customers", [])
  );

  const [sales] = useState(() =>
    getStoredData("smartstore_sales", [])
  );

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    localStorage.setItem("smartstore_customers", JSON.stringify(customers));
  }, [customers]);

  const customerDetails = useMemo(() => {
    return customers.map((customer) => {
      const customerSales = sales.filter((sale) => {
        const salePhone = (sale.customerPhone || "").replace(/\D/g, "");
        const customerPhone = (customer.phone || "").replace(/\D/g, "");

        return (
          salePhone &&
          customerPhone &&
          salePhone !== "N/A" &&
          salePhone === customerPhone
        );
      });

      const totalSpent = customerSales.reduce(
        (total, sale) => total + Number(sale.grandTotal || 0),
        0
      );

      return {
        ...customer,
        totalOrders: customerSales.length,
        totalSpent,
      };
    });
  }, [customers, sales]);

  const filteredCustomers = customerDetails.filter((customer) => {
    const value = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(value) ||
      customer.phone.toLowerCase().includes(value) ||
      customer.email.toLowerCase().includes(value)
    );
  });

  const totalSpent = customerDetails.reduce(
    (total, customer) => total + customer.totalSpent,
    0
  );

  function openAddModal() {
    setEditingCustomer(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
    });
    setShowModal(true);
  }

  function openEditModal(customer) {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
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

  function saveCustomer(e) {
    e.preventDefault();

    const name = formData.name.trim();
    const phone = formData.phone.trim();

    if (!name || !phone) {
      alert("Please enter customer name and phone number.");
      return;
    }

    const duplicate = customers.some(
      (customer) =>
        customer.phone.replace(/\D/g, "") === phone.replace(/\D/g, "") &&
        customer.id !== editingCustomer?.id
    );

    if (duplicate) {
      alert("A customer with this phone number already exists.");
      return;
    }

    if (editingCustomer) {
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === editingCustomer.id
            ? { ...customer, ...formData, name, phone }
            : customer
        )
      );
    } else {
      const newCustomer = {
        id: Date.now(),
        ...formData,
        name,
        phone,
        createdAt: new Date().toLocaleDateString("en-IN"),
      };

      setCustomers((current) => [newCustomer, ...current]);
    }

    setShowModal(false);
  }

  function deleteCustomer(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (confirmed) {
      setCustomers((current) =>
        current.filter((customer) => customer.id !== id)
      );
    }
  }

  return (
    <div className="customers-page">
      <div className="page-heading">
        <div>
          <h1>Customer Management</h1>
          <p>Manage your store customers and their purchase details.</p>
        </div>

        <button className="add-customer-btn" onClick={openAddModal}>
          <UserPlus size={18} />
          Add Customer
        </button>
      </div>

      {/* Customer Statistics */}
      <div className="customer-stats">
        <div className="customer-stat-card">
          <div className="customer-stat-icon blue">
            <Users size={22} />
          </div>
          <div>
            <p>Total Customers</p>
            <h2>{customers.length}</h2>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon green">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p>Total Customer Orders</p>
            <h2>
              {customerDetails.reduce(
                (total, customer) => total + customer.totalOrders,
                0
              )}
            </h2>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon purple">
            <Users size={22} />
          </div>
          <div>
            <p>Customer Revenue</p>
            <h2>₹{totalSpent.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="customer-table-container">
        <div className="customer-toolbar">
          <h2>All Customers</h2>

          <div className="customer-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="customer-table-scroll">
          <table className="customer-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="customer-name-cell">
                      <div className="customer-avatar">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <strong>{customer.name}</strong>
                    </div>
                  </td>

                  <td>{customer.phone}</td>
                  <td>{customer.email || "—"}</td>
                  <td>{customer.totalOrders}</td>
                  <td className="customer-spent">
                    ₹{customer.totalSpent.toFixed(2)}
                  </td>
                  <td>{customer.address || "—"}</td>

                  <td>
                    <div className="customer-actions">
                      <button
                        className="edit-customer"
                        title="Edit customer"
                        onClick={() => openEditModal(customer)}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="delete-customer"
                        title="Delete customer"
                        onClick={() => deleteCustomer(customer.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="7" className="customer-empty">
                    {search
                      ? "No matching customers found."
                      : "No customers added yet. Click Add Customer to get started."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      {showModal && (
        <div className="customer-modal-overlay">
          <div className="customer-modal">
            <div className="customer-modal-header">
              <div>
                <h2>
                  {editingCustomer ? "Edit Customer" : "Add New Customer"}
                </h2>
                <p>Enter the customer details below.</p>
              </div>

              <button
                className="customer-close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveCustomer}>
              <div className="customer-form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter customer name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="customer-form-group">
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

              <div className="customer-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="customer-form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  placeholder="Enter customer address"
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="customer-modal-actions">
                <button
                  type="button"
                  className="customer-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="customer-save-btn">
                  {editingCustomer ? "Update Customer" : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
