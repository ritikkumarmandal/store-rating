import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client.js';
import { useAuth, homeFor } from '../context/AuthContext.jsx';
import FormField from '../components/FormField.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  if (user) return <Navigate to={homeFor(user.role)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      nav(homeFor(data.user.role));
    } catch (err) { setError(errMsg(err)); }
  };
  return (
    <div className="card auth">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <FormField label="Email"><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></FormField>
        <FormField label="Password"><input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></FormField>
        {error && <p className="error">{error}</p>}
        <button className="btn">Login</button>
      </form>
      <p className="muted">New here? <Link to="/signup">Create an account</Link></p>
    </div>
  );
}
