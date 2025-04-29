/**
 * Format currency to VND
 * @param amount Amount to format
 * @returns Formatted amount
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    .replace('₫', 'VNĐ');
};

/**
 * Get color based on status
 * @param status Status value
 * @returns Color string for Tag component
 */
export const getColorByStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: 'green',
    draft: 'gold',
    pending: 'blue',
    rejected: 'red',
    completed: 'green',
    inProgress: 'processing',
  };
  
  return statusMap[status.toLowerCase()] || 'default';
}; 