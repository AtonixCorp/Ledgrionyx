import React from 'react';

const Table = ({ columns, data, onRowClick, actions }) => {
  return (
    <div className="table-wrapper">
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} width={col.width}>
                {col.header || col.label}
              </th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} onClick={() => onRowClick?.(row)} className={onRowClick ? 'clickable' : ''}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="actions-cell">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
