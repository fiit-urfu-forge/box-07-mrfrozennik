import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Download, Upload, Calendar } from 'lucide-react';
import { formatDate } from '../utils/date';

export const ExportImport = () => {
  const { exportData, importData } = useAppStore();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleExport = () => {
    if (!dateRange.start || !dateRange.end) {
      alert('Выберите период для экспорта');
      return;
    }
    const data = exportData(dateRange.start, dateRange.end);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `food-tracker-export-${dateRange.start}-${dateRange.end}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        importData(data);
        alert('Данные успешно импортированы');
      } catch (error) {
        alert('Ошибка при импорте файла');
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Экспорт / Импорт данных</h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Экспорт данных
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Начальная дата
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                max={formatDate(today)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Конечная дата
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                max={formatDate(today)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleExport}
            disabled={!dateRange.start || !dateRange.end}
            className="w-full md:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Экспортировать выбранный период</span>
          </button>
        </div>

        <div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Импорт данных
          </h3>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Перетащите JSON-файл с данными или выберите файл
            </p>
            <input
              type="file"
              id="import-file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <label
              htmlFor="import-file"
              className="inline-block px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
            >
              Выбрать файл
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
              Файл должен быть в формате JSON, экспортированным из этого приложения
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};