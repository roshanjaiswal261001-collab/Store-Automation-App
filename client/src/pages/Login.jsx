
import { useState } from 'react';
import { Store, LockKeyhole, User } from 'lucide-react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username === 'admin' && password === 'admin123') {
      setError('');
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-logo">
          <Store size={30} />
        </div>

        <h1>SmartStore</h1>
        <p className="login-subtitle">Store Management System</p>

        <h2>Admin Login</h2>
        <p className="login-description">
          Login to manage your store
        </p>

        <form onSubmit={handleSubmit}>
          <label>Username</label>

          <div className="login-input">
            <User size={18} />
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <label>Password</label>

          <div className="login-input">
            <LockKeyhole size={18} />
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        <p className="login-footer">
          SmartStore Admin Panel
        </p>

      </div>
    </div>
  );
}

export default Login;
