import { useState } from 'react';
import { LibraryItem, KBZHU } from '../../types';
import { X } from 'lucide-react';

interface ProductFormProps {
  initialData?: Partial<LibraryItem>;
  onSubmit: (data: Omit<LibraryItem, 'id'>) => void;
  onCancel: () => void;
}

export const ProductForm = ({ initialData, onSubmit, onCancel }: ProductFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [barcode, setBarcode] = useState(initialData?.barcode || '');
  const [calories, setCalories] = useState(initialData?.baseKBZHU?.calories.toString() || '');
  const [proteins, setProteins] = useState(initialData?.baseKBZHU?.proteins.toString() || '');
  const [fats, setFats] = useState(initialData?.baseKBZHU?.fats.toString() || '');
  const [carbs, setCarbs] = useState(initialData?.baseKBZHU?.carbs.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseKBZHU: KBZHU = {
      calories: Number.parseFloat(calories) || 0,
      proteins: Number.parseFloat(proteins) || 0,
      fats: Number.parseFloat(fats) || 0,
      carbs: Number.parseFloat(carbs) || 0,
    };
    onSubmit({
      name,
      barcode: barcode || undefined,
      baseKBZHU,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {initialData?.id ? 'Редактировать продукт' : 'Новый продукт'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Название *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Например, Куриная грудка"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Штрихкод (если есть)
            </label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456789012"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Калории (на 100г) *
              </label>
              <input
                type="number"
                step="0.1"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Белки (г) *
              </label>
              <input
                type="number"
                step="0.1"
                value={proteins}
                onChange={(e) => setProteins(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Жиры (г) *
              </label>
              <input
                type="number"
                step="0.1"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Углеводы (г) *
              </label>
              <input
                type="number"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};