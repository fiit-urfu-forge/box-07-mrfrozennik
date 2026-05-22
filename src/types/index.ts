export interface KBZHU {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}

// ---------------- БИБЛИОТЕКА ПРОДУКТОВ ----------------

// Базовый продукт в библиотеке (единый источник истины)
export interface LibraryItem {
  id: string; // Уникальный ID продукта
  name: string;
  barcode?: string;
  baseKBZHU: KBZHU; // Всегда приведено к значениям на 100г для унификации
  isArchived?: boolean; // Флаг для скрытия из поиска
}

// ---------------- ДНЕВНИК ПИТАНИЯ ----------------

// Элемент списка (Съеденное блюдо)
export interface FoodLogItem {
  id: string; // Уникальный ID конкретной записи в дневнике
  type: 'food';
  libraryItemId: string; // Ссылка на базовый продукт из библиотеки
  weight: number; // Вес съеденной порции в граммах
}

// Группа (Строго до 3 уровней вложенности)
export interface FoodGroup {
  id: string;
  type: 'group';
  name: string;
  items: Array<FoodLogItem | FoodGroup>;
  isExpanded?: boolean;
}

// Приём пищи
export interface Meal {
  id: string;
  name: string;
  items: Array<FoodLogItem | FoodGroup>;
}

// Запись одного дня
export interface DayRecord {
  date: string; // 'YYYY-MM-DD'
  meals: Meal[];
}

// ---------------- НАСТРОЙКИ И КОРЕНЬ ----------------

export interface UserSettings {
  targetKBZHU: KBZHU;
  defaultMeals: string[]; // По умолчанию: ['Завтрак', 'Перекус', 'Обед', 'Перекус', 'Ужин']
}

// Корневое состояние хранилища (AppState)
export interface AppState {
  library: Record<string, LibraryItem>; // Словарь всех продуктов: ключ - id
  records: Record<string, DayRecord>;   // Словарь дней: ключ - дата
  settings: UserSettings;
}

// Типы для операций с библиотекой
export type LibraryItemMap = Record<string, LibraryItem>;
export type DayRecordMap = Record<string, DayRecord>;