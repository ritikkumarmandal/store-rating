import { useState } from 'react';
import api, { errMsg } from '../api/client.js';
import SortableTable from '../components/SortableTable.jsx';
import { useList } from '../hooks.js';

function RatingControl({ store, onSaved }) {
  const [value, setValue] = useState(store.myRating || '');
  const [err, setErr] = useState('');
  const save = async () => {
    try { await api.put(`/stores/${store.id}/rating`, { rating: Number(value) }); setErr(''); onSaved(); }
    catch (e) { setErr(errMsg(e)); }
  };
  return (
    <div className="rate">
      <select value={value} onChange={(e) => setValue(e.target.value)}>
        <option value="">Select</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <button className="btn small" disabled={!value || Number(value) === store.myRating} onClick={save}>{store.myRating ? 'Modify' : 'Submit'}</button>
      {err && <small className="error">{err}</small>}
    </div>
  );
}

export default function UserStores() {
  const list = useList('/stores');
  const cols = [
    { key: 'name', label: 'Store', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Overall rating', sortable: true, render: (r) => (r.rating ? `★ ${r.rating}` : 'Not rated') },
    { key: 'myRating', label: 'Your rating', render: (r) => r.myRating ?? '—' },
    { key: 'action', label: 'Rate', render: (r) => <RatingControl key={`${r.id}-${r.myRating}`} store={r} onSaved={list.reload} /> },
  ];
  return (
    <div className="page">
      <h2>Stores</h2>
      <div className="filters">
        <input placeholder="Search by name" value={list.filters.name || ''} onChange={(e) => list.setFilters({ ...list.filters, name: e.target.value })} />
        <input placeholder="Search by address" value={list.filters.address || ''} onChange={(e) => list.setFilters({ ...list.filters, address: e.target.value })} />
      </div>
      <SortableTable columns={cols} rows={list.rows} sortBy={list.sortBy} order={list.order} onSort={list.onSort} />
    </div>
  );
}
