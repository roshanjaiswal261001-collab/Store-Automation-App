
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Receipt,
  Printer,
  CheckCircle,
} from "lucide-react";
import { initialProducts } from "../data/products";

function getStoredData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function Billing() {
  const [products, setProducts] = useState(() =>
    getStoredData("smartstore_products", initialProducts)
  );

  const [sales, setSales] = useState(() =>
    getStoredData("smartstore_sales", [])
  );

  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [invoice, setInvoice] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("smartstore_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("smartstore_sales", JSON.stringify(sales));
  }, [sales]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.price * item.cartQuantity,
        0
      ),
    [cart]
  );

  const discountAmount = (subtotal * Number(discount || 0)) / 100;
  const taxableAmount = subtotal - discountAmount;
  const gst = taxableAmount * 0.05;
  const grandTotal = taxableAmount + gst;

  function addToCart(product) {
    if (product.quantity <= 0) {
      setMessage("This product is out of stock.");
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);

      if (existing) {
        if (existing.cartQuantity >= product.quantity) {
          setMessage("You cannot add more than available stock.");
          return currentCart;
        }

        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, cartQuantity: 1 }];
    });

    setMessage("");
  }

  function changeQuantity(id, amount) {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.id !== id) return item;

          const product = products.find((p) => p.id === id);
          const newQuantity = item.cartQuantity + amount;

          if (newQuantity > product.quantity) {
            setMessage("Not enough stock available.");
            return item;
          }

          return { ...item, cartQuantity: newQuantity };
        })
        .filter((item) => item.cartQuantity > 0)
    );

    setMessage("");
  }

  function removeFromCart(id) {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));
  }

  function completeCheckout() {
    if (cart.length === 0) {
      setMessage("Please add products to the cart first.");
      return;
    }

    // Check stock again before completing the sale.
    const stockIsAvailable = cart.every((item) => {
      const product = products.find((p) => p.id === item.id);
      return product && product.quantity >= item.cartQuantity;
    });

    if (!stockIsAvailable) {
      setMessage("Some products have insufficient stock. Please refresh the cart.");
      return;
    }

    const sale = {
      id: Date.now(),
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      customerName: customerName.trim() || "Walk-in Customer",
      customerPhone: customerPhone.trim() || "N/A",
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.cartQuantity,
        total: item.price * item.cartQuantity,
      })),
      subtotal,
      discountPercent: Number(discount || 0),
      discountAmount,
      gst,
      grandTotal,
      date: new Date().toLocaleString("en-IN"),
    };

    const updatedProducts = products.map((product) => {
      const soldItem = cart.find((item) => item.id === product.id);

      return soldItem
        ? { ...product, quantity: product.quantity - soldItem.cartQuantity }
        : product;
    });

    setProducts(updatedProducts);
    setSales((currentSales) => [sale, ...currentSales]);
    setInvoice(sale);
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscount(0);
    setMessage("Sale completed successfully!");
  }

  function printInvoice() {
    window.print();
  }

  function closeInvoice() {
    setInvoice(null);
    setMessage("");
  }

  return (
    <div className="billing-page">
      <div className="page-heading">
        <div>
          <h1>Billing & POS</h1>
          <p>Create bills and manage customer purchases.</p>
        </div>
        <div className="billing-sales-count">
          <Receipt size={18} />
          Total Sales: {sales.length}
        </div>
      </div>

      {message && (
        <div className="billing-message">
          {message}
        </div>
      )}

      <div className="billing-layout">
        {/* Product Section */}
        <section className="billing-products">
          <div className="billing-section-heading">
            <h2>Available Products</h2>
            <span>{filteredProducts.length} products</span>
          </div>

          <div className="billing-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="billing-product-grid">
            {filteredProducts.map((product) => (
              <div className="billing-product-card" key={product.id}>
                <div className="billing-product-icon">
                  <ShoppingCart size={23} />
                </div>

                <h3>{product.name}</h3>
                <p>{product.category}</p>

                <div className="billing-product-bottom">
                  <strong>₹{Number(product.price).toFixed(2)}</strong>
                  <span className={product.quantity <= 5 ? "stock-low" : "stock-good"}>
                    Stock: {product.quantity}
                  </span>
                </div>

                <button
                  className="add-cart-btn"
                  onClick={() => addToCart(product)}
                  disabled={product.quantity <= 0}
                >
                  <Plus size={16} />
                  {product.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <p className="billing-empty">No products found.</p>
            )}
          </div>
        </section>

        {/* Cart Section */}
        <section className="billing-cart">
          <div className="billing-section-heading">
            <h2>Shopping Cart</h2>
            <span>{cart.length} items</span>
          </div>

          <div className="billing-customer">
            <label>Customer Name</label>
            <input
              type="text"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <label>Phone Number</label>
            <input
              type="tel"
              placeholder="Enter phone number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div className="billing-cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <ShoppingCart size={35} />
                <p>Your cart is empty</p>
                <span>Add products to start billing.</span>
              </div>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p>₹{Number(item.price).toFixed(2)} each</p>
                  </div>

                  <div className="cart-item-actions">
                    <button onClick={() => changeQuantity(item.id, -1)}>
                      <Minus size={14} />
                    </button>

                    <span>{item.cartQuantity}</span>

                    <button onClick={() => changeQuantity(item.id, 1)}>
                      <Plus size={14} />
                    </button>

                    <button
                      className="remove-cart-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <strong>
                    ₹{(item.price * item.cartQuantity).toFixed(2)}
                  </strong>
                </div>
              ))
            )}
          </div>

          <div className="billing-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>₹{subtotal.toFixed(2)}</strong>
            </div>

            <div className="summary-row discount-row">
              <label htmlFor="discount">Discount (%)</label>
              <input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => {
                  const value = Math.max(
                    0,
                    Math.min(100, Number(e.target.value || 0))
                  );
                  setDiscount(value);
                }}
              />
            </div>

            <div className="summary-row">
              <span>Discount Amount</span>
              <strong>- ₹{discountAmount.toFixed(2)}</strong>
            </div>

            <div className="summary-row">
              <span>GST (5%)</span>
              <strong>₹{gst.toFixed(2)}</strong>
            </div>

            <div className="summary-total">
              <span>Grand Total</span>
              <strong>₹{grandTotal.toFixed(2)}</strong>
            </div>

            <button
              className="checkout-btn"
              onClick={completeCheckout}
              disabled={cart.length === 0}
            >
              <CheckCircle size={18} />
              Complete Checkout
            </button>
          </div>
        </section>
      </div>

      {/* Invoice Modal */}
      {invoice && (
        <div className="invoice-overlay">
          <div className="invoice-modal">
            <div className="invoice-print-area">
              <div className="invoice-header">
                <h2>SMARTSTORE</h2>
                <p>Store Automation System</p>
                <h3>INVOICE</h3>
              </div>

              <div className="invoice-details">
                <p><strong>Invoice:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Date:</strong> {invoice.date}</p>
                <p><strong>Customer:</strong> {invoice.customerName}</p>
                <p><strong>Phone:</strong> {invoice.customerPhone}</p>
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>₹{item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-total">
                <p>Subtotal: ₹{invoice.subtotal.toFixed(2)}</p>
                <p>Discount: - ₹{invoice.discountAmount.toFixed(2)}</p>
                <p>GST: ₹{invoice.gst.toFixed(2)}</p>
                <h3>Grand Total: ₹{invoice.grandTotal.toFixed(2)}</h3>
              </div>

              <p className="invoice-thankyou">Thank you for shopping with us!</p>
            </div>

            <div className="invoice-actions">
              <button className="print-invoice-btn" onClick={printInvoice}>
                <Printer size={17} /> Print Invoice
              </button>
              <button className="close-invoice-btn" onClick={closeInvoice}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;
