
import {
  ShoppingBag,
  IndianRupee,
  Package,
  AlertTriangle
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

import { useState } from 'react';

// Sample weekly sales data for the chart
const salesData = [
  { day: 'Mon', sales: 1200 },
  { day: 'Tue', sales: 1800 },
  { day: 'Wed', sales: 1500 },
  { day: 'Thu', sales: 2200 },
  { day: 'Fri', sales: 1900 },
  { day: 'Sat', sales: 2800 },
  { day: 'Sun', sales: 2400 }
];

// Read saved data from localStorage
function getSavedData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function Dashboard() {
  const [products] = useState(() =>
    getSavedData('smartstore_products')
  );

  const [sales] = useState(() =>
    getSavedData('smartstore_sales')
  );

  // Calculate dashboard values
  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) => Number(product.quantity) <= 5
  );

  const totalRevenue = sales.reduce((total, sale) => {
    const amount = Number(
      sale.total ??
      sale.grandTotal ??
      sale.totalAmount ??
      sale.amount ??
      0
    );

    return total + amount;
  }, 0);

  const totalOrders = sales.length;

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'blue'
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingBag,
      color: 'green'
    },
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'purple'
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: 'orange'
    }
  ];

  // Show latest four transactions
  const recentTransactions = [...sales].reverse().slice(0, 4);

  return (
    <div className="dashboard">

      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <h1>Store Dashboard</h1>
          <p>Manage your shop and check daily activities.</p>
        </div>

        <span className="today-label">
          Store Overview
        </span>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.title}>
              <div className="stat-top">
                <span>{stat.title}</span>

                <div className={`stat-icon ${stat.color}`}>
                  <Icon size={21} />
                </div>
              </div>

              <h2>{stat.value}</h2>

              <p className="stat-change">
                {stat.title === 'Low Stock Items'
                  ? 'Check available stock'
                  : 'Current store records'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Sales Chart and Stock Details */}
      <div className="dashboard-grid">

        <section className="panel sales-panel">
          <div className="panel-heading">
            <div>
              <h3>Weekly Sales</h3>
              <p>Sample sales data for the week</p>
            </div>

            <span className="chart-label">
              This Week
            </span>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString('en-IN')}`,
                    'Sales'
                  ]}
                />

                <Bar
                  dataKey="sales"
                  fill="#5577e8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Low Stock Products */}
        <section className="panel stock-panel">
          <h3>Stock Alerts</h3>
          <p>Products with 5 or fewer units</p>

          {lowStockProducts.length > 0 ? (
            lowStockProducts.slice(0, 5).map((product) => (
              <div className="stock-item" key={product.id}>
                <div>
                  <strong>{product.name}</strong>
                  <span>
                    {product.quantity} units left
                  </span>
                </div>

                <AlertTriangle
                  size={19}
                  color="#e99b37"
                />
              </div>
            ))
          ) : (
            <p className="empty-message">
              No low stock products available.
            </p>
          )}
        </section>
      </div>

      {/* Recent Transactions */}
      <section className="panel transactions-panel">
        <div className="panel-heading">
          <div>
            <h3>Recent Transactions</h3>
            <p>Latest customer orders</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((item, index) => {
                  const amount = Number(
                    item.total ??
                    item.grandTotal ??
                    item.totalAmount ??
                    item.amount ??
                    0
                  );

                  const customer =
                    item.customerName ||
                    item.customer ||
                    'Walk-in Customer';

                  const status = item.status || 'Completed';

                  return (
                    <tr key={item.id || index}>
                      <td>{item.id || `Order ${index + 1}`}</td>

                      <td>{customer}</td>

                      <td>
                        ₹{amount.toLocaleString('en-IN')}
                      </td>

                      <td>
                        <span
                          className={`status ${status.toLowerCase()}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="empty-message">
                    No transactions yet. Create your first bill
                    from the Billing section.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}

export default Dashboard;
