/**
 * CSV Export Utility
 * Exports student login records to CSV format
 */

export const exportToCSV = (records, filename = 'student_records.csv') => {
  if (!records || records.length === 0) {
    alert('No records to export');
    return;
  }

  // CSV headers
  const headers = ['Name', 'SID', 'Login Time'];

  // Format records into CSV rows
  const rows = records.map(record => [
    `"${record.name.replace(/"/g, '""')}"`, // Escape quotes in names
    `"${record.sid}"`,
    `"${new Date(record.loginTime).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })}"`,
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
