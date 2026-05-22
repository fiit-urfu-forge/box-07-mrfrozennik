import { LibraryItem } from '../types';

export const getNameCollisions = (library: Record<string, LibraryItem>): Record<string, number> => {
  const nameCount: Record<string, number> = {};
  Object.values(library).forEach(item => {
    const key = item.name.toLowerCase();
    nameCount[key] = (nameCount[key] || 0) + 1;
  });
  return nameCount;
};

export const hasNameCollision = (library: Record<string, LibraryItem>, itemName: string): boolean => {
  const key = itemName.toLowerCase();
  const count = Object.values(library).filter(item => item.name.toLowerCase() === key).length;
  return count > 1;
};

export const filterArchived = (library: Record<string, LibraryItem>, showArchived: boolean = false): LibraryItem[] => {
  const items = Object.values(library);
  if (showArchived) return items;
  return items.filter(item => !item.isArchived);
};

export const searchLibrary = (library: Record<string, LibraryItem>, query: string): LibraryItem[] => {
  const items = filterArchived(library);
  if (!query.trim()) return items;
  const q = query.toLowerCase();
  return items.filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.barcode?.toLowerCase().includes(q)
  );
};