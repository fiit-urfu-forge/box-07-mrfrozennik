import React, { useState } from 'react';
import { Meal, FoodLogItem, FoodGroup } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { AddFoodModal } from './AddFoodModal';
import { AddGroupModal } from './AddGroupModal';
import { FoodItemRow } from './FoodItemRow';

interface MealCardProps {
  meal: Meal;
  dateStr: string;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, dateStr }) => {
  // Вместо простых boolean флагов, храним конкретный ID цели (куда добавляем)
  const [foodTargetId, setFoodTargetId] = useState<string | null>(null);
  const [groupTargetId, setGroupTargetId] = useState<string | null>(null);

  const { removeFromMealOrGroup, toggleGroupExpanded, state } = useAppStore();

  // ФУНКЦИЯ ДЛЯ БЕЗОПАСНОГО УДАЛЕНИЯ (Consent window)
  const handleDeleteCheck = (id: string, name: string, isGroup: boolean) => {
    const text = isGroup 
      ? `Вы уверены, что хотите удалить группу "${name}" и всё её содержимое?` 
      : `Вы уверены, что хотите удалить продукт "${name}"?`;
      
    if (window.confirm(text)) {
      removeFromMealOrGroup(dateStr, meal.id, id);
    }
  };

  // Рекурсивный рендеринг элементов дневника (включая группы любой вложенности)
  const renderLogItem = (item: FoodLogItem | FoodGroup) => {
    if (item.type === 'food') {
      const libItem = state.library.find(l => l.id === item.libraryItemId);
      if (!libItem) return null;
      return (
        <FoodItemRow 
          key={item.id} 
          item={item} 
          libItem={libItem} 
          onDelete={() => handleDeleteCheck(item.id, libItem.name, false)} 
        />
      );
    }

    // Если это группа:
    return (
      <div key={item.id} className="ml-4 border-l-2 border-slate-200 dark:border-slate-700 pl-3 my-2 space-y-1">
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded">
          <div 
            className="font-medium text-sm text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1"
            onClick={() => toggleGroupExpanded(dateStr, meal.id, item.id)}
          >
            <span>{item.isExpanded ? '▼' : '►'}</span>
            <span>{item.name}</span>
          </div>
          
          {/* КНОПКИ УПРАВЛЕНИЯ ГРУППОЙ */}
          <div className="flex gap-2 text-xs">
            {/* ТЕПЕРЬ ТУТ МОЖНО СОЗДАВАТЬ ПРОДУКТЫ! */}
            <button 
              onClick={() => setFoodTargetId(item.id)} 
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              + Продукт
            </button>
            <button 
              onClick={() => setGroupTargetId(item.id)} 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              + Подгруппу
            </button>
            <button 
              onClick={() => handleDeleteCheck(item.id, item.name, true)} 
              className="text-red-500 hover:text-red-600"
            >
              Удалить
            </button>
          </div>
        </div>

        {item.isExpanded && (
          <div className="space-y-1 pt-1">
            {item.items.length === 0 ? (
              <div className="text-xs text-slate-400 italic pl-2">Пустая группа</div>
            ) : (
              item.items.map(child => renderLogItem(child))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xs p-4">
      <div className="flex justify-between items-center mb-4 border-b border-slate-50 dark:border-slate-800 pb-2">
        <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">{meal.name}</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setFoodTargetId(meal.id)} 
            className="text-xs bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-2.5 py-1.5 rounded-lg font-medium hover:bg-emerald-100"
          >
            + Продукт
          </button>
          <button 
            onClick={() => setGroupTargetId(meal.id)} 
            className="text-xs bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-1.5 rounded-lg font-medium hover:bg-slate-100"
          >
            + Группу
          </button>
        </div>
      </div>

      <div className="space-y-1">
        {meal.items.length === 0 ? (
          <p className="text-sm text-slate-400 italic text-center py-4">Нет записей</p>
        ) : (
          meal.items.map(item => renderLogItem(item))
        )}
      </div>

      {/* МОДАЛКИ С ПЕРЕДАЧЕЙ TARGET_ID */}
      {foodTargetId !== null && (
        <AddFoodModal 
          isOpen={true} 
          onClose={() => setFoodTargetId(null)} 
          mealId={meal.id} 
          targetId={foodTargetId} 
          date={dateStr} 
        />
      )}

      {groupTargetId !== null && (
        <AddGroupModal 
          isOpen={true} 
          onClose={() => setGroupTargetId(null)} 
          mealId={meal.id} 
          targetId={groupTargetId} 
          date={dateStr} 
        />
      )}
    </div>
  );
};