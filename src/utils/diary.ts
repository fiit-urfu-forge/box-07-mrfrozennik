import { FoodLogItem, FoodGroup } from '../types';

export const isFoodGroup = (item: FoodLogItem | FoodGroup): item is FoodGroup => {
  return item.type === 'group';
};

export const calculateDepth = (items: (FoodLogItem | FoodGroup)[], currentDepth = 0): number => {
  let maxDepth = currentDepth;
  items.forEach(item => {
    if (isFoodGroup(item)) {
      const depth = calculateDepth(item.items, currentDepth + 1);
      if (depth > maxDepth) maxDepth = depth;
    }
  });
  return maxDepth;
};

export const flattenItems = (items: (FoodLogItem | FoodGroup)[]): FoodLogItem[] => {
  const result: FoodLogItem[] = [];
  items.forEach(item => {
    if (isFoodGroup(item)) {
      result.push(...flattenItems(item.items));
    } else {
      result.push(item);
    }
  });
  return result;
};