import { DayRecord, LibraryItem } from '../../types';
import { Meal } from './Meal';
import { useAppStore } from '../../store/useAppStore';
import { useState } from 'react';
import { LibraryModal } from '../library/LibraryModal';
import { ProductForm } from '../library/ProductForm';
import { generateId } from '../../utils/id';

interface DiaryProps {
  date: string;
  dayRecord: DayRecord;
  library: Record<string, LibraryItem>;
}

export const Diary = ({ date, dayRecord, library }: DiaryProps) => {
  const {
    updateDayRecord,
    addFoodToMeal,
    addLibraryItem,
  } = useAppStore();

  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  

  const handleAddFood = (mealId: string) => {
    setSelectedMealId(mealId);
    setLibraryModalOpen(true);
  };

  const handleAddGroup = (mealId: string) => {
    const groupName = prompt('Введите название группы:');
    if (!groupName) return;

    const updatedMeals = dayRecord.meals.map(meal => {
      if (meal.id === mealId) {
        const newGroup = {
          id: generateId(),
          type: 'group' as const,
          name: groupName,
          items: [],
          isExpanded: true,
        };
        return { ...meal, items: [...meal.items, newGroup] };
      }
      return meal;
    });

    updateDayRecord(date, { meals: updatedMeals });
  };

  const handleSelectLibraryItem = (item: LibraryItem) => {
    if (selectedMealId) {
      const weight = prompt('Введите вес порции в граммах:', '100');
      const weightNum = Number.parseFloat(weight || '100');
      if (!isNaN(weightNum) && weightNum > 0) {
        addFoodToMeal(date, selectedMealId, item.id, weightNum);
      }
      setSelectedMealId(null);
      setLibraryModalOpen(false);
    }
  };

  const handleUpdateWeight = (itemId: string, newWeight: number) => {
    // Find and update weight in day record
    const updatedMeals = dayRecord.meals.map(meal => {
      const updateItems = (items: any[]): any[] => {
        return items.map(item => {
          if (item.type === 'food' && item.id === itemId) {
            return { ...item, weight: newWeight };
          }
          if (item.type === 'group') {
            return { ...item, items: updateItems(item.items) };
          }
          return item;
        });
      };
      return { ...meal, items: updateItems(meal.items) };
    });
    updateDayRecord(date, { meals: updatedMeals });
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedMeals = dayRecord.meals.map(meal => {
      const filterItems = (items: any[]): any[] => {
        return items.filter(item => {
          if (item.type === 'food' && item.id === itemId) return false;
          if (item.type === 'group') {
            const filteredChildren = filterItems(item.items);
            if (filteredChildren.length === 0) return false;
            return { ...item, items: filteredChildren };
          }
          return true;
        });
      };
      return { ...meal, items: filterItems(meal.items) };
    });
    updateDayRecord(date, { meals: updatedMeals });
  };

  const handleDeleteGroup = (groupId: string) => {
    const updatedMeals = dayRecord.meals.map(meal => {
      const filterItems = (items: any[]): any[] => {
        return items.filter(item => {
          if (item.type === 'group' && item.id === groupId) return false;
          if (item.type === 'group') {
            const filteredChildren = filterItems(item.items);
            if (filteredChildren.length === 0) return false;
            return { ...item, items: filteredChildren };
          }
          return true;
        });
      };
      return { ...meal, items: filterItems(meal.items) };
    });
    updateDayRecord(date, { meals: updatedMeals });
  };

  const handleToggleGroupExpand = (groupId: string) => {
    const updatedMeals = dayRecord.meals.map(meal => {
      const toggleItems = (items: any[]): any[] => {
        return items.map(item => {
          if (item.type === 'group' && item.id === groupId) {
            return { ...item, isExpanded: !item.isExpanded };
          }
          if (item.type === 'group') {
            return { ...item, items: toggleItems(item.items) };
          }
          return item;
        });
      };
      return { ...meal, items: toggleItems(meal.items) };
    });
    updateDayRecord(date, { meals: updatedMeals });
  };

  const handleAddFoodToGroup = (_groupId: string) => {
    // TODO: implement adding food to specific group
    setLibraryModalOpen(true);
  };

  const handleAddSubgroup = (groupId: string) => {
    const groupName = prompt('Введите название подгруппы:');
    if (!groupName) return;

    const updatedMeals = dayRecord.meals.map(meal => {
      const addSubgroup = (items: any[]): any[] => {
        return items.map(item => {
          if (item.type === 'group' && item.id === groupId) {
            const newSubgroup = {
              id: generateId(),
              type: 'group' as const,
              name: groupName,
              items: [],
              isExpanded: true,
            };
            return { ...item, items: [...item.items, newSubgroup] };
          }
          if (item.type === 'group') {
            return { ...item, items: addSubgroup(item.items) };
          }
          return item;
        });
      };
      return { ...meal, items: addSubgroup(meal.items) };
    });
    updateDayRecord(date, { meals: updatedMeals });
  };

  const handleAddManualProduct = () => {
    setProductFormOpen(true);
  };

  const handleScanBarcode = () => {
    alert('Функция сканирования штрихкода в разработке');
  };

  const handleSubmitProduct = (data: any) => {
    addLibraryItem(data);
    setProductFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {dayRecord.meals.map(meal => (
          <Meal
            key={meal.id}
            meal={meal}
            library={library}
            onAddFood={() => handleAddFood(meal.id)}
            onAddGroup={() => handleAddGroup(meal.id)}
            onUpdateWeight={handleUpdateWeight}
            onDeleteItem={handleDeleteItem}
            onDeleteGroup={handleDeleteGroup}
            onToggleGroupExpand={handleToggleGroupExpand}
            onAddFoodToGroup={handleAddFoodToGroup}
            onAddSubgroup={handleAddSubgroup}
          />
        ))}
      </div>

      <LibraryModal
        isOpen={libraryModalOpen}
        onClose={() => {
          setLibraryModalOpen(false);
          setSelectedMealId(null);
        }}
        library={library}
        onSelectItem={handleSelectLibraryItem}
        onAddManual={handleAddManualProduct}
        onScanBarcode={handleScanBarcode}
      />

      {productFormOpen && (
        <ProductForm
          onSubmit={handleSubmitProduct}
          onCancel={() => setProductFormOpen(false)}
        />
      )}
    </div>
  );
};