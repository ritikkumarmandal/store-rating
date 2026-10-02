import { useCallback, useEffect, useState } from 'react';
import api from './api/client.js';

// Fetches a list with server-side sorting + filtering.
export function useList(url, defaultSort = 'name') {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState(defaultSort);
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)), sortBy, order };
      const { data } = await api.get(url, { params });
      setRows(data);
    } finally { setLoading(false); }
  }, [url, filters, sortBy, order]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const onSort = (key) => {
    if (key === sortBy) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(key); setOrder('asc'); }
  };
  return { rows, filters, setFilters, sortBy, order, onSort, loading, reload: load };
}
