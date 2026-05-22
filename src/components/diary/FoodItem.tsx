import { useState } from 'react';
import { FoodLogItem } from '../../types';
import { LibraryItem } from '../../types';
import { calculateKBZHUForWeight } from '../../utils/kbzhu';
import { Edit2, Trash2, Check, X } from 'lucide-react';

interface FoodItemProps {
  item: FoodLogItem;
  libraryItem: LibraryItem | undefined;
  onUpdateWeight: (itemId: string, newWeight: number) => void;
  onDelete: (itemId: string) => void;
}

export const FoodItem = ({ item, libraryItem, onUpdateWeight, onDelete }: FoodItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [weightInput, setWeightInput] = useState(item.weight.toString());

  const handleSave = () => {
    const newWeight = Number.parseFloat(weightInput);
    if (!isNaN(newWeight) && newWeight > 0) {
      onUpdateWeight(item.id, newWeight);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setWeightInput(item.weight.toString());
    setIsEditing(false);
  };

  if (!libraryItem) {
    return (
      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="text-red-700 dark:text-red-300">Продукт не найден в библиотеке</div>
      </div>
    );
  }

  const kbzhu = calculateKBZHUForWeight(libraryItem.baseKBZHU, item.weight);

  return (
    <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">{libraryItem.name}</h3>
            <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
              {libraryItem.baseKBZHU.calories} ккал/100г
            </span>
          </div>

          <div className="mt-2 flex items-center space-x-4">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-24 px-3 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="1"
                  step="1"
                  autoFocus
                />
                <span className="text-slate-600 dark:text-slate-400">г</span>
                <button
                  onClick={handleSave}
                  className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                  aria-label="Save"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  aria-label="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {item.weight} г
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                  aria-label="Edit weight"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2 text-sm">
            <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="font-semibold text-blue-700 dark:text-blue-300">{kbzhu.calories}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">ккал</div>
            </div>
            <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="font-semibold text-green-700 dark:text-green-300">{kbzhu.proteins}g</div>
              <div className="text-xs text-green-600 dark:text-green-400">белки</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <div className="font-semibold text-yellow-700 dark:text-yellow-300">{kbzhu.fats}g</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">жиры</div>
            </div>
            <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
              <div className="font-semibold text-purple-700 dark:text-purple-300">{kbzhu.carbs}g</div>
              <div className="text-xs text-purple-600 dark:text-purple-400">углеводы</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDelete(item.id)}
          className="ml-4 p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          aria-label="Delete"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};