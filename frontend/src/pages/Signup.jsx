import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import FormField from '../components/FormField.jsx';
import { validate } from '../utils.js';

export default function Signup() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form, ['name', 'email', 'address', 'password']);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    try {
      const { data } = await api.post('/auth/signup', form);
      login(data);
      nav('/stores');
    } catch (err) { setServerError(errMsg(err)); }
  };
  return (
    <div className="card auth">
      <h2>Sign up</h2>
      <form onSubmit={submit} noValidate>
        <FormField label="Name (20-60 chars)" error={errors.name}><input value={form.name} onChange={set('name')} /></FormField>
        <FormField label="Email" error={errors.email}><input type="email" value={form.email} onChange={set('email')} /></FormField>
        <FormField label="Address (max 400 chars)" error={errors.address}><textarea rows="3" value={form.address} onChange={set('address')} /></FormField>
        <FormField label="Password (8-16, 1 uppercase, 1 special)" error={errors.password}><input type="password" value={form.password} onChange={set('password')} /></FormField>
        {serverError && <p className="error">{serverError}</p>}
        <button className="btn">Create account</button>
      </form>
      <p className="muted">Already registered? <Link to="/login">Login</Link></p>
    </div>
  );
}
