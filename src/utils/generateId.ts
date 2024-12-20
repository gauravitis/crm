/**
 * Generates a unique reference number for quotations in the format: QT-YYYYMMDD-XXXX
 * where XXXX is a random 4-digit number
 */
export function generateId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `QT-${year}${month}${day}-${random}`;
}
