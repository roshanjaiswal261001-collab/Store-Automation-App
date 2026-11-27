
import { NavLink } from 'react-router-dom';

import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Users,
  Truck,
  ChartNoAxesCombined,
  Store
} from 'lucide-react';

function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Inventory', path: '/inventory', icon: Warehouse },
    { name: 'Billing', path: '/billing', icon: ShoppingCart },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Suppliers', path: '/suppliers', icon: Truck },
    { name: 'Reports', path: '/reports', icon: ChartNoAxesCombined }
  ];

  return (
    <aside className="sidebar">

      <div className="brand">
        <div className="brand-icon">
          <Store size={22} />
        </div>

        <div>
          <h2>SmartStore</h2>
          <span>Store Management</span>
        </div>
      </div>

      <p className="menu-heading">STORE MENU</p>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              to={item.path}
              key={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                isActive ? 'menu-link active' : 'menu-link'
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-avatar">A</div>

        <div>
          <strong>Project Admin</strong>
          <span>Store Manager</span>
        </div>
      </div>

    </aside>
  );
}

export default Sidebar;
