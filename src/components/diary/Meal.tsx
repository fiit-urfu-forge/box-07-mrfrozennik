import { Meal as MealType, LibraryItem } from '../../types';
import { FoodItem } from './FoodItem';
import { FoodGroup as FoodGroupComponent } from './FoodGroup';
import { Plus, Trash2 } from 'lucide-react';

interface MealProps {
  meal: MealType;
  library: Record<string, LibraryItem>;
  onAddFood: (mealId: string) => void;
  onAddGroup: (mealId: string) => void;
  onUpdateWeight: (itemId: string, newWeight: number) => void;
  onDeleteItem: (itemId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onToggleGroupExpand: (groupId: string) => void;
  onAddFoodToGroup: (groupId: string) => void;
  onAddSubgroup: (groupId: string) => void;
  onDeleteMeal?: (mealId: string) => void;
}

export const Meal = ({
  meal,
  library,
  onAddFood,
  onAddGroup,
  onUpdateWeight,
  onDeleteItem,
  onDeleteGroup,
  onToggleGroupExpand,
  onAddFoodToGroup,
  onAddSubgroup,
  onDeleteMeal,
}: MealProps) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto mb-6">
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{meal.name}</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onAddFood(meal.id)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить блюдо</span>
          </button>
          <button
            onClick={() => onAddGroup(meal.id)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Группа</span>
          </button>
          {onDeleteMeal && (
            <button
              onClick={() => onDeleteMeal(meal.id)}
              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              aria-label="Delete meal"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {meal.items.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            Приём пищи пуст. Добавьте продукты или группы.
          </div>
        ) : (
          meal.items.map(item => {
            if (item.type === 'food') {
              return (
                <FoodItem
                  key={item.id}
                  item={item}
                  libraryItem={library[item.libraryItemId]}
                  onUpdateWeight={onUpdateWeight}
                  onDelete={onDeleteItem}
                />
              );
            } else {
              return (
                <FoodGroupComponent
                  key={item.id}
                  group={item}
                  library={library}
                  depth={0}
                  onToggleExpand={onToggleGroupExpand}
                  onUpdateWeight={onUpdateWeight}
                  onDeleteItem={onDeleteItem}
                  onDeleteGroup={onDeleteGroup}
                  onAddFoodToGroup={onAddFoodToGroup}
                  onAddSubgroup={onAddSubgroup}
                />
              );
            }
          })
        )}
      </div>
    </div>
  );
};