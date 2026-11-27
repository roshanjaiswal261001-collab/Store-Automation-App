
import { useMemo, useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Package,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { initialProducts } from "../data/products";

function getStoredData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function Reports() {
  const [filter, setFilter] = useState("30");

  const sales = getStoredData("smartstore_sales", []);
  const products = getStoredData("smartstore_products", initialProducts);

  const filteredSales = useMemo(() => {
    if (filter === "all") return sales;

    const days = Number(filter);
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    return sales.filter((sale) => {
      const saleDate = new Date(Number(sale.id));
      return !Number.isNaN(saleDate.getTime()) && saleDate >= startDate;
    });
  }, [sales, filter]);

  const totalRevenue = filteredSales.reduce(
    (total, sale) => total + Number(sale.grandTotal || 0),
    0
  );

  const totalOrders = filteredSales.length;

  const averageOrderValue =
    totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const totalItemsSold = filteredSales.reduce(
    (total, sale) =>
      total +
      (sale.items || []).reduce(
        (itemTotal, item) => itemTotal + Number(item.quantity || 0),
        0
      ),
    0
  );

  const lowStockProducts = products.filter(
    (product) => Number(product.quantity) > 0 && Number(product.quantity) <= 5
  );

  const outOfStockProducts = products.filter(
    (product) => Number(product.quantity) === 0
  );

  const chartData = useMemo(() => {
    const groupedSales = {};

    filteredSales.forEach((sale) => {
      const date = new Date(Number(sale.id));

      if (Number.isNaN(date.getTime())) return;

      const dateKey = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      if (!groupedSales[dateKey]) {
        groupedSales[dateKey] = {
          date: dateKey,
          revenue: 0,
          orders: 0,
          sortDate: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          ).getTime(),
        };
      }

      groupedSales[dateKey].revenue += Number(sale.grandTotal || 0);
      groupedSales[dateKey].orders += 1;
    });

    return Object.values(groupedSales).sort(
      (a, b) => a.sortDate - b.sortDate
    );
  }, [filteredSales]);

  const topProducts = useMemo(() => {
    const productSales = {};

    filteredSales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const name = item.name || "Unknown Product";

        if (!productSales[name]) {
          productSales[name] = {
            name,
            quantity: 0,
            revenue: 0,
          };
        }

        productSales[name].quantity += Number(item.quantity || 0);
        productSales[name].revenue += Number(
          item.total || Number(item.price || 0) * Number(item.quantity || 0)
        );
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredSales]);

  const recentSales = [...filteredSales].slice(0, 8);

  return (
    <div className="reports-page">
      <div className="page-heading">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Understand your store performance and sales activity.</p>
        </div>

        <select
          className="report-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="report-stats">
        <div className="report-stat-card">
          <div className="report-stat-icon blue">
            <IndianRupee size={22} />
          </div>
          <div>
            <p>Total Revenue</p>
            <h2>₹{totalRevenue.toFixed(2)}</h2>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon green">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p>Total Orders</p>
            <h2>{totalOrders}</h2>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon purple">
            <TrendingUp size={22} />
          </div>
          <div>
            <p>Average Order Value</p>
            <h2>₹{averageOrderValue.toFixed(2)}</h2>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon orange">
            <Package size={22} />
          </div>
          <div>
            <p>Items Sold</p>
            <h2>{totalItemsSold}</h2>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="report-chart-card">
        <div className="report-card-heading">
          <div>
            <h2>Sales Overview</h2>
            <p>Revenue generated on each sales date.</p>
          </div>
          <BarChart3 size={22} color="#2563eb" />
        </div>

        {chartData.length === 0 ? (
          <div className="report-no-data">
            <BarChart3 size={38} />
            <p>No sales data available for this period.</p>
            <span>Complete a sale from the Billing page to see your chart.</span>
          </div>
        ) : (
          <div className="report-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  formatter={(value) => [
                    `₹${Number(value).toFixed(2)}`,
                    "Revenue",
                  ]}
                />
                <Bar
                  dataKey="revenue"
                  fill="#2563eb"
                  radius={[5, 5, 0, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Products and Stock Alerts */}
      <div className="report-bottom-grid">
        <div className="report-panel">
          <div className="report-card-heading">
            <div>
              <h2>Top Selling Products</h2>
              <p>Products ranked by quantity sold.</p>
            </div>
            <Package size={21} color="#2563eb" />
          </div>

          {topProducts.length === 0 ? (
            <div className="report-no-data small">
              <p>No product sales available yet.</p>
            </div>
          ) : (
            <div className="top-products-list">
              {topProducts.map((product, index) => (
                <div className="top-product-row" key={product.name}>
                  <div className="top-product-rank">{index + 1}</div>

                  <div className="top-product-info">
                    <strong>{product.name}</strong>
                    <span>{product.quantity} units sold</span>
                  </div>

                  <strong className="top-product-revenue">
                    ₹{product.revenue.toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="report-panel">
          <div className="report-card-heading">
            <div>
              <h2>Stock Alerts</h2>
              <p>Products that need attention.</p>
            </div>
            <AlertTriangle size={21} color="#ea580c" />
          </div>

          <div className="stock-alert-summary">
            <div className="stock-alert-box low">
              <span>Low Stock</span>
              <strong>{lowStockProducts.length}</strong>
            </div>

            <div className="stock-alert-box out">
              <span>Out of Stock</span>
              <strong>{outOfStockProducts.length}</strong>
            </div>
          </div>

          <div className="report-stock-list">
            {[...outOfStockProducts, ...lowStockProducts]
              .slice(0, 5)
              .map((product) => (
                <div className="report-stock-row" key={product.id}>
                  <span>{product.name}</span>
                  <strong className={product.quantity === 0 ? "out-text" : "low-text"}>
                    {product.quantity === 0
                      ? "Out of stock"
                      : `${product.quantity} left`}
                  </strong>
                </div>
              ))}

            {lowStockProducts.length + outOfStockProducts.length === 0 && (
              <p className="no-stock-alert">All products have sufficient stock.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="report-sales-card">
        <div className="report-card-heading">
          <div>
            <h2>Recent Sales</h2>
            <p>Latest transactions in the selected period.</p>
          </div>
        </div>

        <div className="report-table-scroll">
          <table className="report-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.invoiceNumber || `INV-${sale.id}`}</td>
                  <td>{sale.customerName || "Walk-in Customer"}</td>
                  <td>{sale.date || "—"}</td>
                  <td>
                    {(sale.items || []).reduce(
                      (total, item) => total + Number(item.quantity || 0),
                      0
                    )}
                  </td>
                  <td className="report-sale-amount">
                    ₹{Number(sale.grandTotal || 0).toFixed(2)}
                  </td>
                </tr>
              ))}

              {recentSales.length === 0 && (
                <tr>
                  <td colSpan="5" className="report-empty">
                    No sales records found. Complete a sale from Billing first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
