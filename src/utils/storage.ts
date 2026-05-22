import { AppState } from '../types';

const STORAGE_KEY = 'food-tracker-state';

const defaultState: AppState = {
  library: {},
  records: {},
  settings: {
    targetKBZHU: { calories: 2000, proteins: 150, fats: 67, carbs: 200 },
    defaultMeals: ['Завтрак', 'Перекус', 'Обед', 'Перекус', 'Ужин'],
  },
};

export const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) return defaultState;
    const parsed = JSON.parse(serializedState);
    return {
      library: parsed.library || {},
      records: parsed.records || {},
      settings: parsed.settings || defaultState.settings,
    };
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return defaultState;
  }
};

export const saveState = (state: AppState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
};