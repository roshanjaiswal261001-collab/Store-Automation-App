
import { useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Billing from './pages/Billing';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Login from './pages/Login';

function StoreLayout({ onLogout }) {
  return (
    <div className="app-container">
      <Sidebar onLogout={onLogout} />

      <div className="main-section">
        <Navbar />

        {/* College Header */}
        <div className="college-header">
          ABESEC Ghaziabad
        </div>

        <main className="page-content">
          <Outlet />
        </main>

        {/* Project Footer */}
        <footer className="app-footer">
          <p>
            <strong>Developed & Maintained By:</strong>
            {' '}Roshan Jaiswal & Rishav Pandey
          </p>

          <p>CSE - 26</p>

          <p>Full Stack Development Team</p>

          <small>
            © 2026 ABESEC Ghaziabad. All Rights Reserved.
          </small>
        </footer>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('smartstore_admin_logged_in') === 'true'
  );

  const handleLogin = () => {
    localStorage.setItem('smartstore_admin_logged_in', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('smartstore_admin_logged_in');
    setIsLoggedIn(false);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isLoggedIn
            ? <Navigate to="/" replace />
            : <Login onLogin={handleLogin} />
        }
      />

      <Route
        path="/"
        element={
          isLoggedIn
            ? <StoreLayout onLogout={handleLogout} />
            : <Navigate to="/login" replace />
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="billing" element={<Billing />} />
        <Route path="customers" element={<Customers />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />}
      />
    </Routes>
  );
}

export default App;
