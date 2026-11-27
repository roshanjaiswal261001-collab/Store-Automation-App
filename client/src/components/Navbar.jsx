
import { Bell, Search } from 'lucide-react';

function Navbar() {
  return (
    <header className="navbar">

      <div className="search-box">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search anything..."
          aria-label="Search"
        />
      </div>

      <div className="navbar-right">

        <button
          className="notification-btn"
          type="button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="profile">
          <div className="profile-avatar">A</div>

          <div>
            <strong>Admin</strong>
            <span>Store Manager</span>
          </div>
        </div>

      </div>
    </header>
  );
}

export default Navbar;
