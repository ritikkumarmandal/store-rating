import { useState } from 'react';
import api, { errMsg } from '../api/client.js';
import FormField from '../components/FormField.jsx';
import { validate } from '../utils.js';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate({ password: form.newPassword }, ['password']);
    setErrors(errs.password ? { newPassword: errs.password } : {});
    if (errs.password) return;
    try {
      await api.put('/auth/password', form);
      setMsg({ type: 'success', text: 'Password updated successfully' });
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) { setMsg({ type: 'error', text: errMsg(err) }); }
  };
  return (
    <div className="card auth">
      <h2>Change password</h2>
      <form onSubmit={submit}>
        <FormField label="Current password"><input type="password" required value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} /></FormField>
        <FormField label="New password" error={errors.newPassword}><input type="password" required value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} /></FormField>
        {msg.text && <p className={msg.type}>{msg.text}</p>}
        <button className="btn">Update</button>
      </form>
    </div>
  );
}
