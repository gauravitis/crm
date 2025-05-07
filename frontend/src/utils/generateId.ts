/**
 * Generates a unique reference number for quotations in the format: QT-YYYYMMDD-XXXX
 * where XXXX is a random 4-digit number
 */
import { format } from 'date-fns';
import { db } from '../config/firebase';
import { doc, runTransaction } from 'firebase/firestore';

// Get the next quotation number
export async function getNextQuotationNumber(): Promise<number> {
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

    return result;
  } catch (error) {
    console.error('Error getting next quotation number:', error);
    // Fallback to a timestamp-based number if transaction fails
    return parseInt(Date.now().toString().slice(-3));
  }
}

// Generate reference number with sequential counter
export async function generateQuotationRef(companyShortCode?: string): Promise<string> {
  try {
    // Use company short code or default to CBL 
    const prefix = companyShortCode || 'CBL';
    
    // Use 2025 as the base year
    const baseYear = 2025;
    const yearStr = `${baseYear}-26`;
    
    const number = await getNextQuotationNumber();
    console.log('Next number:', number, typeof number);
    
    const sequentialNumber = number.toString().padStart(3, '0');
    console.log('Padded number:', sequentialNumber);
    
    const ref = `${prefix}-${yearStr}-${sequentialNumber}`;
    console.log('Final reference:', ref, typeof ref);
    
    return ref;
  } catch (error) {
    console.error('Error in generateQuotationRef:', error);
    throw error;
  }
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
