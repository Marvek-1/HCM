import { formatDateTime } from './helpers';

/**
 * Escape a CSV cell value — wraps in quotes if it contains commas, quotes, or newlines.
 */
const escapeCSV = (value) => {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Export an array of order objects to a CSV file and trigger browser download.
 */
export const exportOrdersToCSV = (orders, filename) => {
  const headers = [
    'Order ID',
    'Country',
    'PATEO Ref',
    'Priority',
    'Status',
    'Warehouse',
    'Split',
    'Items',
    'Intervention Type',
    'Created By',
    'Lab Reviewed By',
    'OSL Approved By',
    'Created Date',
    'Updated Date'
  ];

  const rows = orders.map(order => [
    order.order_number || '',
    order.country || '',
    order.pateo_ref || '',
    order.priority || '',
    order.status || '',
    order.fulfillment_warehouse_code || '',
    order.isSplit ? 'Yes' : (order.fulfillmentWarehouses && order.fulfillmentWarehouses.length > 0 ? 'No' : ''),
    order.items ? order.items.length : 0,
    order.intervention_type || '',
    order.created_by_name || '',
    order.lab_reviewed_by_name || '',
    order.osl_approved_by_name || '',
    formatDateTime(order.created_at, { short: true }),
    formatDateTime(order.updated_at, { short: true })
  ]);

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  // Add BOM for Excel UTF-8 compatibility
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
