import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const { state, updateSettings } = useAppStore();
  const [targetCalories, setTargetCalories] = useState(state.settings.targetKBZHU.calories.toString());
  const [targetProteins, setTargetProteins] = useState(state.settings.targetKBZHU.proteins.toString());
  const [targetFats, setTargetFats] = useState(state.settings.targetKBZHU.fats.toString());
  const [targetCarbs, setTargetCarbs] = useState(state.settings.targetKBZHU.carbs.toString());
  const [meals, setMeals] = useState(state.settings.defaultMeals);
  const [newMeal, setNewMeal] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings({
      targetKBZHU: {
        calories: Number.parseFloat(targetCalories) || 0,
        proteins: Number.parseFloat(targetProteins) || 0,
        fats: Number.parseFloat(targetFats) || 0,
        carbs: Number.parseFloat(targetCarbs) || 0,
      },
      defaultMeals: meals,
    });
    onClose();
  };

  const handleAddMeal = () => {
    if (newMeal.trim() && !meals.includes(newMeal.trim())) {
      setMeals([...meals, newMeal.trim()]);
      setNewMeal('');
    }
  };

  const handleRemoveMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Настройки</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Целевые значения КБЖУ</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Калории (ккал)
                </label>
                <input
                  type="number"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Белки (г)
                </label>
                <input
                  type="number"
                  value={targetProteins}
                  onChange={(e) => setTargetProteins(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Жиры (г)
                </label>
                <input
                  type="number"
                  value={targetFats}
                  onChange={(e) => setTargetFats(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Углеводы (г)
                </label>
                <input
                  type="number"
                  value={targetCarbs}
                  onChange={(e) => setTargetCarbs(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Приёмы пищи по умолчанию</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Эти приёмы пищи будут автоматически создаваться для новых дней
            </p>
            <div className="space-y-3">
              {meals.map((meal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <span className="text-slate-800 dark:text-slate-200">{meal}</span>
                  <button
                    onClick={() => handleRemoveMeal(index)}
                    className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    aria-label="Remove meal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMeal}
                  onChange={(e) => setNewMeal(e.target.value)}
                  placeholder="Название приёма пищи"
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMeal()}
                />
                <button
                  onClick={handleAddMeal}
                  className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Добавить</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-800">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Сохранить настройки</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};