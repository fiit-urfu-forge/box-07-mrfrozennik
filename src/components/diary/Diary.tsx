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
    addFoodToGroup,
    addGroupToMeal,
    updateFoodWeight,
    deleteItem,
    deleteGroup,
    toggleGroupExpanded,
    addLibraryItem,
  } = useAppStore();

  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  

  const handleAddFood = (mealId: string) => {
    setSelectedMealId(mealId);
    setLibraryModalOpen(true);
  };

  const handleAddGroup = (mealId: string) => {
    console.log('handleAddGroup', mealId);
    const groupName = prompt('Введите название группы:');
    if (!groupName) return;
    console.log('Calling addGroupToMeal', date, mealId, groupName);
    addGroupToMeal(date, mealId, groupName);
  };

  const handleSelectLibraryItem = (item: LibraryItem) => {
    console.log('handleSelectLibraryItem', { item, selectedGroupId, selectedMealId });
    const weight = prompt('Введите вес порции в граммах:', '100');
    const weightNum = Number.parseFloat(weight || '100');
    if (isNaN(weightNum) || weightNum <= 0) {
      return;
    }
    if (selectedGroupId && selectedMealId) {
      console.log('Calling addFoodToGroup', date, selectedMealId, selectedGroupId, item.id, weightNum);
      addFoodToGroup(date, selectedMealId, selectedGroupId, item.id, weightNum);
      setSelectedGroupId(null);
      setSelectedMealId(null);
    } else if (selectedMealId) {
      console.log('Calling addFoodToMeal', date, selectedMealId, item.id, weightNum);
      addFoodToMeal(date, selectedMealId, item.id, weightNum);
      setSelectedMealId(null);
    }
    setLibraryModalOpen(false);
  };

  const handleUpdateWeight = (itemId: string, newWeight: number) => {
    updateFoodWeight(date, itemId, newWeight);
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItem(date, itemId);
  };

  const handleDeleteGroup = (groupId: string) => {
    deleteGroup(date, groupId);
  };

  const handleToggleGroupExpand = (groupId: string) => {
    toggleGroupExpanded(date, groupId);
  };

  const handleAddFoodToGroup = (groupId: string, mealId: string) => {
    setSelectedGroupId(groupId);
    setSelectedMealId(mealId);
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