import { useState, useEffect, useCallback } from 'react';
import { AppState, DayRecord, LibraryItem, FoodLogItem, FoodGroup, KBZHU } from '../types';
import { loadState, saveState } from '../utils/storage';
import { generateId } from '../utils/id';

// Единственный источник правды на уровне модуля (синглтон)
let globalState: AppState = loadState();
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

const updateGlobalState = (updater: (prev: AppState) => AppState) => {
  globalState = updater(globalState);
  saveState(globalState);
  notifyListeners();
};

// --- РЕКУРСИВНЫЕ ХЕЛПЕРЫ ДЛЯ ДЕРЕВА ГРУПП ---

// Рекурсивное добавление элемента в нужную группу по её ID
const addItemToNestedStructure = (
  items: (FoodLogItem | FoodGroup)[],
  targetId: string,
  itemToAdd: FoodLogItem | FoodGroup
): boolean => {
  for (let item of items) {
    if (item.type === 'group') {
      if (item.id === targetId) {
        item.items.push(itemToAdd);
        return true;
      }
      if (addItemToNestedStructure(item.items, targetId, itemToAdd)) {
        return true;
      }
    }
  }
  return false;
};

// Рекурсивное удаление элемента/группы по ID из любого уровня вложенности
const removeItemFromNestedStructure = (
  items: (FoodLogItem | FoodGroup)[],
  targetId: string
): boolean => {
  const index = items.findIndex(item => item.id === targetId);
  if (index !== -1) {
    items.splice(index, 1);
    return true;
  }
  for (let item of items) {
    if (item.type === 'group') {
      if (removeItemFromNestedStructure(item.items, targetId)) {
        return true;
      }
    }
  }
  return false;
};

// Рекурсивное сворачивание/разворачивание групп
const toggleGroupExpandedInNested = (
  items: (FoodLogItem | FoodGroup)[],
  targetId: string
): boolean => {
  for (let item of items) {
    if (item.type === 'group') {
      if (item.id === targetId) {
        item.isExpanded = !item.isExpanded;
        return true;
      }
      if (toggleGroupExpandedInNested(item.items, targetId)) {
        return true;
      }
    }
  }
  return false;
};

// Рекурсивный подсчет КБЖУ с учетом всех уровней вложенности групп
const getItemsKBZHU = (items: (FoodLogItem | FoodGroup)[], library: LibraryItem[]): KBZHU => {
  const totals = { calories: 0, proteins: 0, fats: 0, carbs: 0 };
  for (const item of items) {
    if (item.type === 'food') {
      const libItem = library.find(l => l.id === item.libraryItemId);
      if (libItem) {
        const factor = item.weight / 100;
        totals.calories += libItem.baseKBZHU.calories * factor;
        totals.proteins += libItem.baseKBZHU.proteins * factor;
        totals.fats += libItem.baseKBZHU.fats * factor;
        totals.carbs += libItem.baseKBZHU.carbs * factor;
      }
    } else if (item.type === 'group') {
      const groupTotals = getItemsKBZHU(item.items, library);
      totals.calories += groupTotals.calories;
      totals.proteins += groupTotals.proteins;
      totals.fats += groupTotals.fats;
      totals.carbs += groupTotals.carbs;
    }
  }
  return totals;
};

const createEmptyDay = (date: string, defaultMeals: string[]): DayRecord => ({
  date,
  meals: defaultMeals.map(name => ({ id: generateId(), name, items: [] }))
});

// --- КАСТООМНЫЙ ХУК ---
export const useAppStore = () => {
  const [, setTick] = useState(0);

  // Подписываем компонент на изменения глобального стейта
  useEffect(() => {
    const forceUpdate = () => setTick(t => t + 1);
    listeners.add(forceUpdate);
    return () => {
      listeners.delete(forceUpdate);
    };
  }, []);

  const getDayRecord = useCallback((date: string): DayRecord => {
    return globalState.records[date] || createEmptyDay(date, globalState.settings.defaultMeals);
  }, []);

  const initializeDay = useCallback((date: string) => {
    if (globalState.records[date]) return;
    updateGlobalState(prev => {
      if (prev.records[date]) return prev;
      return {
        ...prev,
        records: {
          ...prev.records,
          [date]: createEmptyDay(date, prev.settings.defaultMeals)
        }
      };
    });
  }, []);

  const addLibraryItem = useCallback((item: Omit<LibraryItem, 'id'>) => {
    const newItem = { ...item, id: generateId() };
    updateGlobalState(prev => ({
      ...prev,
      library: [...prev.library, newItem]
    }));
    return newItem;
  }, []);

  // Универсальное добавление продукта: в сам прием пищи или в любую группу внутри него
  const addFoodToMealOrGroup = useCallback((date: string, mealId: string, targetId: string, libraryItemId: string, weight: number) => {
    const foodItem: FoodLogItem = { id: generateId(), type: 'food', libraryItemId, weight };
    updateGlobalState(prev => {
      const day = prev.records[date] || createEmptyDay(date, prev.settings.defaultMeals);
      const meals = day.meals.map(meal => {
        if (meal.id === mealId) {
          if (meal.id === targetId) {
            return { ...meal, items: [...meal.items, foodItem] };
          }
          const itemsCopy = JSON.parse(JSON.stringify(meal.items));
          if (addItemToNestedStructure(itemsCopy, targetId, foodItem)) {
            return { ...meal, items: itemsCopy };
          }
        }
        return meal;
      });
      return { ...prev, records: { ...prev.records, [date]: { ...day, meals } } };
    });
  }, []);

  // Универсальное добавление группы/подгруппы
  const addGroupToMealOrGroup = useCallback((date: string, mealId: string, targetId: string, groupName: string) => {
    const group: FoodGroup = { id: generateId(), type: 'group', name: groupName, items: [], isExpanded: true };
    updateGlobalState(prev => {
      const day = prev.records[date] || createEmptyDay(date, prev.settings.defaultMeals);
      const meals = day.meals.map(meal => {
        if (meal.id === mealId) {
          if (meal.id === targetId) {
            return { ...meal, items: [...meal.items, group] };
          }
          const itemsCopy = JSON.parse(JSON.stringify(meal.items));
          if (addItemToNestedStructure(itemsCopy, targetId, group)) {
            return { ...meal, items: itemsCopy };
          }
        }
        return meal;
      });
      return { ...prev, records: { ...prev.records, [date]: { ...day, meals } } };
    });
  }, []);

  // Универсальное удаление элемента (продукта или целой группы) любого уровня
  const removeFromMealOrGroup = useCallback((date: string, mealId: string, targetId: string) => {
    updateGlobalState(prev => {
      const day = prev.records[date];
      if (!day) return prev;
      const meals = day.meals.map(meal => {
        if (meal.id === mealId) {
          const itemsCopy = JSON.parse(JSON.stringify(meal.items));
          if (removeItemFromNestedStructure(itemsCopy, targetId)) {
            return { ...meal, items: itemsCopy };
          }
        }
        return meal;
      });
      return { ...prev, records: { ...prev.records, [date]: { ...day, meals } } };
    });
  }, []);

  const toggleGroupExpanded = useCallback((date: string, mealId: string, groupId: string) => {
    updateGlobalState(prev => {
      const day = prev.records[date];
      if (!day) return prev;
      const meals = day.meals.map(meal => {
        if (meal.id === mealId) {
          const itemsCopy = JSON.parse(JSON.stringify(meal.items));
          if (toggleGroupExpandedInNested(itemsCopy, groupId)) {
            return { ...meal, items: itemsCopy };
          }
        }
        return meal;
      });
      return { ...prev, records: { ...prev.records, [date]: { ...day, meals } } };
    });
  }, []);

  const calculateDayKBZHU = useCallback((date: string): KBZHU => {
    const day = globalState.records[date];
    if (!day) return { calories: 0, proteins: 0, fats: 0, carbs: 0 };
    const totals = { calories: 0, proteins: 0, fats: 0, carbs: 0 };
    day.meals.forEach(meal => {
      const mealTotals = getItemsKBZHU(meal.items, globalState.library);
      totals.calories += mealTotals.calories;
      totals.proteins += mealTotals.proteins;
      totals.fats += mealTotals.fats;
      totals.carbs += mealTotals.carbs;
    });
    return {
      calories: Math.round(totals.calories),
      proteins: Math.round(totals.proteins * 10) / 10,
      fats: Math.round(totals.fats * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
    };
  }, []);

  const updateSettings = useCallback((updates: Partial<AppState['settings']>) => {
    updateGlobalState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  }, []);

  const importState = useCallback((newState: AppState) => {
    updateGlobalState(() => newState);
  }, []);

  return {
    state: globalState,
    getDayRecord,
    initializeDay,
    addLibraryItem,
    addFoodToMealOrGroup,
    addGroupToMealOrGroup,
    removeFromMealOrGroup,
    toggleGroupExpanded,
    calculateDayKBZHU,
    updateSettings,
    importState,
  };
};