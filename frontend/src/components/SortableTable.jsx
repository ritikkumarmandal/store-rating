// columns: [{ key, label, sortable?, render? }]
export default function SortableTable({ columns, rows, sortBy, order, onSort, onRowClick, empty = 'No records found' }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.sortable ? 'sortable' : ''} onClick={() => c.sortable && onSort(c.key)}>
                {c.label}{c.sortable && sortBy === c.key ? (order === 'asc' ? ' ▲' : ' ▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length} className="muted center">{empty}</td></tr>}
          {rows.map((r) => (
            <tr key={r.id} onClick={() => onRowClick?.(r)} className={onRowClick ? 'clickable' : ''}>
              {columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : (r[c.key] ?? '—')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
