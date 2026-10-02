import { useEffect, useState } from 'react';
import api, { errMsg } from '../api/client.js';
import SortableTable from '../components/SortableTable.jsx';
import FormField from '../components/FormField.jsx';
import { useList } from '../hooks.js';
import { validate } from '../utils.js';

const Stat = ({ label, value }) => <div className="card stat"><div className="muted">{label}</div><div className="num">{value ?? '…'}</div></div>;

function AddUserForm({ onDone }) {
  const [f, setF] = useState({ name: '', email: '', address: '', password: '', role: 'USER' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(f, ['name', 'email', 'address', 'password']);
    setErrors(errs); setMsg('');
    if (Object.keys(errs).length) return;
    try { await api.post('/admin/users', f); setF({ ...f, name: '', email: '', address: '', password: '' }); onDone(); }
    catch (err) { setMsg(errMsg(err)); }
  };
  return (
    <form className="card grid" onSubmit={submit} noValidate>
      <h3>Add user</h3>
      <FormField label="Name" error={errors.name}><input value={f.name} onChange={set('name')} /></FormField>
      <FormField label="Email" error={errors.email}><input value={f.email} onChange={set('email')} /></FormField>
      <FormField label="Password" error={errors.password}><input type="password" value={f.password} onChange={set('password')} /></FormField>
      <FormField label="Role"><select value={f.role} onChange={set('role')}><option value="USER">Normal User</option><option value="ADMIN">Admin</option><option value="OWNER">Store Owner</option></select></FormField>
      <FormField label="Address" error={errors.address}><textarea rows="2" value={f.address} onChange={set('address')} /></FormField>
      {msg && <p className="error">{msg}</p>}
      <button className="btn">Add user</button>
    </form>
  );
}

function AddStoreForm({ onDone }) {
  const [f, setF] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  useEffect(() => { api.get('/admin/users', { params: { role: 'OWNER' } }).then((r) => setOwners(r.data)); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(f, ['email', 'address']);
    if (!f.name.trim()) errs.name = 'Store name required';
    setErrors(errs); setMsg('');
    if (Object.keys(errs).length) return;
    try { await api.post('/admin/stores', { ...f, ownerId: f.ownerId || null }); setF({ name: '', email: '', address: '', ownerId: '' }); onDone(); }
    catch (err) { setMsg(errMsg(err)); }
  };
  return (
    <form className="card grid" onSubmit={submit} noValidate>
      <h3>Add store</h3>
      <FormField label="Store name" error={errors.name}><input value={f.name} onChange={set('name')} /></FormField>
      <FormField label="Email" error={errors.email}><input value={f.email} onChange={set('email')} /></FormField>
      <FormField label="Owner (optional)"><select value={f.ownerId} onChange={set('ownerId')}><option value="">— none —</option>{owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></FormField>
      <FormField label="Address" error={errors.address}><textarea rows="2" value={f.address} onChange={set('address')} /></FormField>
      {msg && <p className="error">{msg}</p>}
      <button className="btn">Add store</button>
    </form>
  );
}

function Filters({ fields, filters, setFilters }) {
  return (
    <div className="filters">
      {fields.map(([k, label, opts]) => opts
        ? <select key={k} value={filters[k] || ''} onChange={(e) => setFilters({ ...filters, [k]: e.target.value })}><option value="">All roles</option>{opts.map((o) => <option key={o}>{o}</option>)}</select>
        : <input key={k} placeholder={`Filter by ${label}`} value={filters[k] || ''} onChange={(e) => setFilters({ ...filters, [k]: e.target.value })} />)}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [tab, setTab] = useState('users');
  const [selected, setSelected] = useState(null);
  const users = useList('/admin/users');
  const stores = useList('/admin/stores');
  const loadStats = () => api.get('/admin/dashboard').then((r) => setStats(r.data));
  useEffect(() => { loadStats(); }, []);
  const refresh = () => { loadStats(); users.reload(); stores.reload(); };
  const openUser = async (u) => setSelected((await api.get(`/admin/users/${u.id}`)).data);

  const userCols = [
    { key: 'name', label: 'Name', sortable: true }, { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true }, { key: 'role', label: 'Role', sortable: true },
  ];
  const storeCols = [
    { key: 'name', label: 'Name', sortable: true }, { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true }, { key: 'rating', label: 'Rating', sortable: true },
  ];

  return (
    <div className="page">
      <h2>Admin dashboard</h2>
      <div className="stats">
        <Stat label="Total users" value={stats.totalUsers} />
        <Stat label="Total stores" value={stats.totalStores} />
        <Stat label="Total ratings" value={stats.totalRatings} />
      </div>
      <div className="two-col"><AddUserForm onDone={refresh} /><AddStoreForm onDone={refresh} /></div>
      <div className="tabs">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
        <button className={tab === 'stores' ? 'active' : ''} onClick={() => setTab('stores')}>Stores</button>
      </div>
      {tab === 'users' ? (
        <>
          <Filters fields={[['name', 'name'], ['email', 'email'], ['address', 'address'], ['role', 'role', ['ADMIN', 'USER', 'OWNER']]]} filters={users.filters} setFilters={users.setFilters} />
          <SortableTable columns={userCols} rows={users.rows} sortBy={users.sortBy} order={users.order} onSort={users.onSort} onRowClick={openUser} />
        </>
      ) : (
        <>
          <Filters fields={[['name', 'name'], ['email', 'email'], ['address', 'address']]} filters={stores.filters} setFilters={stores.setFilters} />
          <SortableTable columns={storeCols} rows={stores.rows} sortBy={stores.sortBy} order={stores.order} onSort={stores.onSort} />
        </>
      )}
      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="card" onClick={(e) => e.stopPropagation()}>
            <h3>User details</h3>
            <p><b>Name:</b> {selected.name}</p><p><b>Email:</b> {selected.email}</p>
            <p><b>Address:</b> {selected.address || '—'}</p><p><b>Role:</b> {selected.role}</p>
            {selected.role === 'OWNER' && <p><b>Store rating:</b> {selected.rating ?? 'No ratings yet'}</p>}
            <button className="btn" onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
