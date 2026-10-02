import { Link, useNavigate } from 'react-router-dom';
import { useAuth, homeFor } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  if (!user) return null;
  return (
    <header className="navbar">
      <Link to={homeFor(user.role)} className="brand">StoreRating</Link>
      <nav>
        <span className="muted">{user.name} · {user.role}</span>
        <Link to="/password">Change password</Link>
        <button className="btn secondary" onClick={() => { logout(); nav('/login'); }}>Logout</button>
      </nav>
    </header>
  );
}
