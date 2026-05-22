import { LibraryItem } from '../types';

const MOCK_PRODUCTS: Record<string, Omit<LibraryItem, 'id'>> = {
  '4601234567890': {
    name: 'Молоко пастеризованное 3.2%',
    barcode: '4601234567890',
    baseKBZHU: { calories: 60, proteins: 3.0, fats: 3.2, carbs: 4.7 },
  },
  '4609876543210': {
    name: 'Хлеб бородинский',
    barcode: '4609876543210',
    baseKBZHU: { calories: 210, proteins: 6.5, fats: 1.3, carbs: 42.0 },
  },
  '4623456789012': {
    name: 'Куриная грудка филе',
    barcode: '4623456789012',
    baseKBZHU: { calories: 113, proteins: 23.6, fats: 1.9, carbs: 0.4 },
  },
};

export const fetchProductByBarcode = async (barcode: string): Promise<Omit<LibraryItem, 'id'> | null> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const product = MOCK_PRODUCTS[barcode];
  if (product) {
    return product;
  }

  // If not found in mock, return null
  return null;
};