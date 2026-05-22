import { KBZHU } from '../types';

export const calculateKBZHUForWeight = (baseKBZHU: KBZHU, weight: number): KBZHU => {
  const factor = weight / 100;
  return {
    calories: Math.round(baseKBZHU.calories * factor),
    proteins: Math.round(baseKBZHU.proteins * factor * 10) / 10,
    fats: Math.round(baseKBZHU.fats * factor * 10) / 10,
    carbs: Math.round(baseKBZHU.carbs * factor * 10) / 10,
  };
};

export const sumKBZHU = (items: KBZHU[]): KBZHU => {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      proteins: acc.proteins + item.proteins,
      fats: acc.fats + item.fats,
      carbs: acc.carbs + item.carbs,
    }),
    { calories: 0, proteins: 0, fats: 0, carbs: 0 }
  );
};

export const calculateCaloriesFromMacros = (proteins: number, fats: number, carbs: number): number => {
  return proteins * 4 + fats * 9 + carbs * 4;
};

export const calculateMacroPercentages = (kbzhu: KBZHU): { proteins: number; fats: number; carbs: number } => {
  const totalCalories = calculateCaloriesFromMacros(kbzhu.proteins, kbzhu.fats, kbzhu.carbs);
  if (totalCalories === 0) return { proteins: 0, fats: 0, carbs: 0 };
  return {
    proteins: (kbzhu.proteins * 4) / totalCalories * 100,
    fats: (kbzhu.fats * 9) / totalCalories * 100,
    carbs: (kbzhu.carbs * 4) / totalCalories * 100,
  };
};