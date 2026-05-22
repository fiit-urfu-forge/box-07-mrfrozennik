import { FoodGroup as FoodGroupType, LibraryItem } from '../../types';
import { FoodItem } from './FoodItem';
import { ChevronDown, ChevronRight, Folder, Trash2, Plus } from 'lucide-react';

interface FoodGroupProps {
  group: FoodGroupType;
  library: Record<string, LibraryItem>;
  depth: number;
  onToggleExpand: (groupId: string) => void;
  onUpdateWeight: (itemId: string, newWeight: number) => void;
  onDeleteItem: (itemId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddFoodToGroup: (groupId: string) => void;
  onAddSubgroup: (groupId: string) => void;
}

export const FoodGroup = ({
  group,
  library,
  depth,
  onToggleExpand,
  onUpdateWeight,
  onDeleteItem,
  onDeleteGroup,
  onAddFoodToGroup,
  onAddSubgroup,
}: FoodGroupProps) => {
  const maxDepth = 3;
  const canAddSubgroup = depth < maxDepth - 1;

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
        onClick={() => onToggleExpand(group.id)}
      >
        <div className="flex items-center space-x-3">
          {group.isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-500" />
          )}
          <Folder className="w-5 h-5 text-slate-500" />
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100">{group.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {group.items.length} элемент(ов)
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {canAddSubgroup && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddSubgroup(group.id);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
              aria-label="Add subgroup"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddFoodToGroup(group.id);
            }}
            className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
            aria-label="Add food"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteGroup(group.id);
            }}
            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            aria-label="Delete group"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {group.isExpanded && (
        <div className="p-4 bg-white dark:bg-slate-900 space-y-3">
          {group.items.map(item => {
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
                <FoodGroup
                  key={item.id}
                  group={item}
                  library={library}
                  depth={depth + 1}
                  onToggleExpand={onToggleExpand}
                  onUpdateWeight={onUpdateWeight}
                  onDeleteItem={onDeleteItem}
                  onDeleteGroup={onDeleteGroup}
                  onAddFoodToGroup={onAddFoodToGroup}
                  onAddSubgroup={onAddSubgroup}
                />
              );
            }
          })}
          {group.items.length === 0 && (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              Группа пуста. Добавьте продукты или подгруппы.
            </div>
          )}
        </div>
      )}
    </div>
  );
};