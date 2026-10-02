import { useEffect, useState } from 'react';
import api from '../api/client.js';
import SortableTable from '../components/SortableTable.jsx';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  useEffect(() => { api.get('/owner/dashboard', { params: { sortBy, order } }).then((r) => setData(r.data)); }, [sortBy, order]);
  const onSort = (k) => (k === sortBy ? setOrder(order === 'asc' ? 'desc' : 'asc') : (setSortBy(k), setOrder('asc')));

  if (!data) return <div className="page">Loading…</div>;
  if (!data.store) return <div className="page"><p className="muted">No store is assigned to your account yet. Contact an administrator.</p></div>;
  const cols = [
    { key: 'name', label: 'User', sortable: true }, { key: 'email', label: 'Email', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true },
    { key: 'ratedAt', label: 'Date', render: (r) => new Date(r.ratedAt).toLocaleDateString() },
  ];
  return (
    <div className="page">
      <h2>{data.store.name}</h2>
      <div className="stats">
        <div className="card stat"><div className="muted">Average rating</div><div className="num">★ {data.store.averageRating}</div></div>
        <div className="card stat"><div className="muted">Total ratings</div><div className="num">{data.store.totalRatings}</div></div>
      </div>
      <h3>Users who rated your store</h3>
      <SortableTable columns={cols} rows={data.raters} sortBy={sortBy} order={order} onSort={onSort} empty="No ratings yet" />
    </div>
  );
}
