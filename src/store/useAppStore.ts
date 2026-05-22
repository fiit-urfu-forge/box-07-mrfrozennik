import { useState, useEffect, useCallback } from 'react';
import { AppState, LibraryItem, DayRecord, FoodLogItem, FoodGroup, Meal, KBZHU } from '../types';
import { loadState, saveState } from '../utils/storage';
import { generateId, generateMealId } from '../utils/id';
import { calculateKBZHUForWeight } from '../utils/kbzhu';

export const useAppStore = () => {
  const [state, setState] = useState<AppState>(loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Library operations
  const addLibraryItem = useCallback((item: Omit<LibraryItem, 'id'>) => {
    const id = generateId();
    const newItem: LibraryItem = { ...item, id };
    setState(prev => ({
      ...prev,
      library: { ...prev.library, [id]: newItem },
    }));
    return id;
  }, []);

  const updateLibraryItem = useCallback((id: string, updates: Partial<LibraryItem>) => {
    setState(prev => {
      const existing = prev.library[id];
      if (!existing) return prev;
      const updatedItem = { ...existing, ...updates };
      return {
        ...prev,
        library: { ...prev.library, [id]: updatedItem },
      };
    });
  }, []);

  const archiveLibraryItem = useCallback((id: string) => {
    updateLibraryItem(id, { isArchived: true });
  }, [updateLibraryItem]);

  // Day operations
  const getDayRecord = useCallback((date: string): DayRecord => {
    const existing = state.records[date];
    if (existing) return existing;

    // Create new day with default meals (does not save to state)
    const meals: Meal[] = state.settings.defaultMeals.map((name, index) => ({
      id: generateMealId(date, index),
      name,
      items: [],
    }));
    return { date, meals };
  }, [state.records, state.settings.defaultMeals]);

  const initializeDay = useCallback((date: string) => {
    const existing = state.records[date];
    if (existing) return;
    
    // Create new day with default meals
    const meals: Meal[] = state.settings.defaultMeals.map((name, index) => ({
      id: generateMealId(date, index),
      name,
      items: [],
    }));
    const newRecord: DayRecord = { date, meals };
    setState(prev => ({
      ...prev,
      records: { ...prev.records, [date]: newRecord },
    }));
  }, [state.records, state.settings.defaultMeals]);

  const updateDayRecord = useCallback((date: string, updates: Partial<DayRecord>) => {
    setState(prev => {
// Get or create day record
      let day = prev.records[date];
      if (!day) {
// Create new day with default meals
        const meals: Meal[] = prev.settings.defaultMeals.map((name, index) => ({
          id: generateMealId(date, index),
          name,
          items: [],
        }));
        day = { date, meals };
      }
      const updatedRecord = { ...day, ...updates, date };
      return {
        ...prev,
        records: { ...prev.records, [date]: updatedRecord },
      };
    });
  }, []);

  const addFoodToMeal = useCallback((date: string, mealId: string, libraryItemId: string, weight: number) => {
    console.log('addFoodToMeal called', { date, mealId, libraryItemId, weight });
    setState(prev => {
      // Get or create day record
      let day = prev.records[date];
      if (!day) {
        // Create new day with default meals
        const meals: Meal[] = prev.settings.defaultMeals.map(name => ({
          id: generateId(),
          name,
          items: [],
        }));
        day = { date, meals };
      }
      
      const foodItem: FoodLogItem = {
        id: generateId(),
        type: 'food',
        libraryItemId,
        weight,
      };
      
      const meals = day.meals.map(meal => {
        if (meal.id === mealId) {
          return { ...meal, items: [...meal.items, foodItem] };
        }
        return meal;
      });
      const updatedDay = { ...day, meals };
      console.log('addFoodToMeal: updating state for', date, 'mealId', mealId, 'new day:', updatedDay);
      return {
        ...prev,
        records: { ...prev.records, [date]: updatedDay },
      };
    });
  }, []);

  const addFoodToGroup = useCallback((date: string, mealId: string, groupId: string, libraryItemId: string, weight: number) => {
    setState(prev => {
      // Get or create day record
      let day = prev.records[date];
      if (!day) {
        // Create new day with default meals
        const meals: Meal[] = prev.settings.defaultMeals.map(name => ({
          id: generateId(),
          name,
          items: [],
        }));
        day = { date, meals };
      }
      
      const foodItem: FoodLogItem = {
        id: generateId(),
        type: 'food',
        libraryItemId,
        weight,
      };
      const addToNested = (items: (FoodLogItem | FoodGroup)[]): (FoodLogItem | FoodGroup)[] => {
        return items.map(item => {
          if (item.type === 'group' && item.id === groupId) {
            return { ...item, items: [...item.items, foodItem] };
          }
          if (item.type === 'group') {
            return { ...item, items: addToNested(item.items) };
          }
          return item;
        });
      };
      const meals = day.meals.map(meal => {
        if (meal.id === mealId) {
          return { ...meal, items: addToNested(meal.items) };
        }
        return meal;
      });
      const updatedDay = { ...day, meals };
      console.log('addFoodToGroup: updating state for', date, 'mealId', mealId, 'groupId', groupId, 'new day:', updatedDay);
      return {
        ...prev,
        records: { ...prev.records, [date]: updatedDay },
      };
    });
  }, []);

  const addGroupToMeal = useCallback((date: string, mealId: string, groupName: string) => {
    setState(prev => {
      // Get or create day record
      let day = prev.records[date];
      if (!day) {
        // Create new day with default meals
        const meals: Meal[] = prev.settings.defaultMeals.map(name => ({
          id: generateId(),
          name,
          items: [],
        }));
        day = { date, meals };
      }
      
      const group: FoodGroup = {
        id: generateId(),
        type: 'group',
        name: groupName,
        items: [],
        isExpanded: true,
      };
      const meals = day.meals.map(meal => {
        if (meal.id === mealId) {
          return { ...meal, items: [...meal.items, group] };
        }
        return meal;
      });
      const updatedDay = { ...day, meals };
      console.log('addGroupToMeal: updating state for', date, 'mealId', mealId, 'groupName', groupName, 'new day:', updatedDay);
      return {
        ...prev,
        records: { ...prev.records, [date]: updatedDay },
      };
    });
  }, []);

  // Helper to recursively update items in groups
  const updateItemInNested = useCallback((items: (FoodLogItem | FoodGroup)[], itemId: string, updates: any): (FoodLogItem | FoodGroup)[] => {
    return items.map(item => {
      if (item.id === itemId) {
        return { ...item, ...updates };
      }
      if (item.type === 'group') {
        return { ...item, items: updateItemInNested(item.items, itemId, updates) };
      }
      return item;
    });
  }, []);

  const updateFoodWeight = useCallback((date: string, itemId: string, newWeight: number) => {
    setState(prev => {
      const day = prev.records[date];
      if (!day) return prev;
      const meals = day.meals.map(meal => ({
        ...meal,
        items: updateItemInNested(meal.items, itemId, { weight: newWeight }),
      }));
      return {
        ...prev,
        records: { ...prev.records, [date]: { ...day, meals } },
      };
    });
  }, []);

  const deleteItem = useCallback((date: string, itemId: string) => {
    const removeItem = (items: (FoodLogItem | FoodGroup)[]): (FoodLogItem | FoodGroup)[] => {
      return items.filter(item => {
        if (item.id === itemId) return false;
        if (item.type === 'group') {
          const filteredChildren = removeItem(item.items);
          if (filteredChildren.length === 0) return false;
          return { ...item, items: filteredChildren };
        }
        return true;
      });
    };
    setState(prev => {
      const day = prev.records[date];
      if (!day) return prev;
      const meals = day.meals.map(meal => ({
        ...meal,
        items: removeItem(meal.items),
      }));
      return {
        ...prev,
        records: { ...prev.records, [date]: { ...day, meals } },
      };
    });
  }, []);

  const deleteGroup = useCallback((date: string, groupId: string) => {
    deleteItem(date, groupId);
  }, [deleteItem]);

  const toggleGroupExpanded = useCallback((date: string, groupId: string) => {
    const toggleInItems = (items: (FoodLogItem | FoodGroup)[]): (FoodLogItem | FoodGroup)[] => {
      return items.map(item => {
        if (item.id === groupId && item.type === 'group') {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.type === 'group') {
          return { ...item, items: toggleInItems(item.items) };
        }
        return item;
      });
    };
    setState(prev => {
      const day = prev.records[date];
      if (!day) return prev;
      const meals = day.meals.map(meal => ({
        ...meal,
        items: toggleInItems(meal.items),
      }));
      return {
        ...prev,
        records: { ...prev.records, [date]: { ...day, meals } },
      };
    });
  }, []);

  // Statistics
  const calculateDayKBZHU = useCallback((date: string): KBZHU => {
    const day = state.records[date];
    if (!day) return { calories: 0, proteins: 0, fats: 0, carbs: 0 };

    const flattenItems = (items: (FoodLogItem | FoodGroup)[]): FoodLogItem[] => {
      const result: FoodLogItem[] = [];
      items.forEach(item => {
        if (item.type === 'food') {
          result.push(item);
        } else {
          result.push(...flattenItems(item.items));
        }
      });
      return result;
    };

    const foodItems = flattenItems(day.meals.flatMap(meal => meal.items));
    const kbzhuArray = foodItems.map(item => {
      const libraryItem = state.library[item.libraryItemId];
      if (!libraryItem) return { calories: 0, proteins: 0, fats: 0, carbs: 0 };
      return calculateKBZHUForWeight(libraryItem.baseKBZHU, item.weight);
    });

    return kbzhuArray.reduce(
      (acc, kbzhu) => ({
        calories: acc.calories + kbzhu.calories,
        proteins: acc.proteins + kbzhu.proteins,
        fats: acc.fats + kbzhu.fats,
        carbs: acc.carbs + kbzhu.carbs,
      }),
      { calories: 0, proteins: 0, fats: 0, carbs: 0 }
    );
  }, [state.records, state.library]);

  // Export/Import
  const exportData = useCallback((startDate: string, endDate: string) => {
    const dates = Object.keys(state.records).filter(date => date >= startDate && date <= endDate);
    const exportedRecords: Record<string, DayRecord> = {};
    const exportedLibrary: Record<string, LibraryItem> = {};

    dates.forEach(date => {
      exportedRecords[date] = state.records[date];
      // Collect library items used in these records
      const day = state.records[date];
      day.meals.forEach(meal => {
        const flatten = (items: (FoodLogItem | FoodGroup)[]): FoodLogItem[] => {
          const result: FoodLogItem[] = [];
          items.forEach(item => {
            if (item.type === 'food') {
              result.push(item);
            } else {
              result.push(...flatten(item.items));
            }
          });
          return result;
        };
        const foodItems = flatten(meal.items);
        foodItems.forEach(item => {
          const libItem = state.library[item.libraryItemId];
          if (libItem) {
            exportedLibrary[libItem.id] = libItem;
          }
        });
      });
    });

    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      records: exportedRecords,
      library: exportedLibrary,
    };
  }, [state.records, state.library]);

  const importData = useCallback((data: any) => {
    if (!data.records || !data.library) {
      throw new Error('Invalid import data format');
    }
    setState(prev => ({
      ...prev,
      library: { ...prev.library, ...data.library },
      records: { ...prev.records, ...data.records },
    }));
  }, []);

  // Settings
  const updateSettings = useCallback((settings: Partial<AppState['settings']>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  }, []);

  return {
    state,
    // Library
    addLibraryItem,
    updateLibraryItem,
    archiveLibraryItem,
    // Days
    getDayRecord,
    initializeDay,
    updateDayRecord,
    addFoodToMeal,
    addFoodToGroup,
    addGroupToMeal,
    updateFoodWeight,
    deleteItem,
    deleteGroup,
    toggleGroupExpanded,
    // Stats
    calculateDayKBZHU,
    // Export/Import
    exportData,
    importData,
    // Settings
    updateSettings,
  };
};