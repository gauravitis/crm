/**
 * Generates a unique reference number for quotations in the format: QT-YYYYMMDD-XXXX
 * where XXXX is a random 4-digit number
 */
import { format } from 'date-fns';
import { db } from '../config/firebase';
import { doc, runTransaction } from 'firebase/firestore';

// Get the next quotation number
export async function getNextQuotationNumber(): Promise<string> {
  const counterRef = doc(db, 'counters', 'quotation');
  
  try {
    const result = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let currentNumber = 1;

      if (counterDoc.exists()) {
        currentNumber = counterDoc.data().currentNumber + 1;
      }

      transaction.set(counterRef, { currentNumber });
      return currentNumber;
    });

    // Format the number with leading zeros
    return result.toString().padStart(3, '0');
  } catch (error) {
    console.error('Error getting next quotation number:', error);
    // Fallback to a timestamp-based number if transaction fails
    return Date.now().toString().slice(-3);
  }
}

// Generate reference number with sequential counter
export async function generateQuotationRef(): Promise<string> {
  const date = new Date();
  const dateStr = format(date, 'dd/MM/yyyy');
  const sequentialNumber = await getNextQuotationNumber();
  return `CBL-${dateStr}-${sequentialNumber}`;
}

// Legacy function for other IDs
export function generateId(): string {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000).toString();
  
  return `QT-${year}${month}${day}-${random}`;
}
