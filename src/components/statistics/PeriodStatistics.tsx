import { useState, useMemo } from 'react';
import { KBZHU, DayRecordMap } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate, parseDate } from '../../utils/date';

interface PeriodStatisticsProps {
  records: DayRecordMap;
  calculateDayKBZHU: (date: string) => KBZHU;
}

export const PeriodStatistics = ({ records, calculateDayKBZHU }: PeriodStatisticsProps) => {
  const [viewMode, setViewMode] = useState<'average' | 'total'>('average');
  const [periodRange, setPeriodRange] = useState<{ start: string; end: string }>(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);
    return {
      start: formatDate(weekAgo),
      end: formatDate(today),
    };
  });

  const allDates = useMemo(() => {
    return Object.keys(records).sort();
  }, [records]);

  const periodData = useMemo(() => {
    const { start, end } = periodRange;
    const startDate = parseDate(start);
    const endDate = parseDate(end);
    const dates: string[] = [];

    // Идем по календарю день за днём
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(formatDate(current));
      current.setDate(current.getDate() + 1);
    }

    if (dates.length === 0) return [];

    return dates.map(date => ({
      date,
      kbzhu: calculateDayKBZHU(date), // Это теперь вернет {0,0,0,0} для пустых дней
    }));
  }, [periodRange, calculateDayKBZHU]);

  const totalKBZHU = periodData.reduce(
    (acc, day) => ({
      calories: acc.calories + day.kbzhu.calories,
      proteins: acc.proteins + day.kbzhu.proteins,
      fats: acc.fats + day.kbzhu.fats,
      carbs: acc.carbs + day.kbzhu.carbs,
    }),
    { calories: 0, proteins: 0, fats: 0, carbs: 0 }
  );

  const averageKBZHU = periodData.length > 0 ? {
    calories: Math.round(totalKBZHU.calories / periodData.length),
    proteins: Math.round(totalKBZHU.proteins / periodData.length * 10) / 10,
    fats: Math.round(totalKBZHU.fats / periodData.length * 10) / 10,
    carbs: Math.round(totalKBZHU.carbs / periodData.length * 10) / 10,
  } : { calories: 0, proteins: 0, fats: 0, carbs: 0 };

  const displayKBZHU = viewMode === 'total' ? totalKBZHU : averageKBZHU;

  const chartData = periodData.map(day => ({
    date: new Date(day.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    calories: day.kbzhu.calories,
    proteins: day.kbzhu.proteins,
    fats: day.kbzhu.fats,
    carbs: day.kbzhu.carbs,
  }));

  const handlePreviousPeriod = () => {
    const start = parseDate(periodRange.start);
    const end = parseDate(periodRange.end);
    const newStart = new Date(start);
    const newEnd = new Date(end);
    newStart.setDate(start.getDate() - (periodData.length || 7));
    newEnd.setDate(end.getDate() - (periodData.length || 7));
    setPeriodRange({
      start: formatDate(newStart),
      end: formatDate(newEnd),
    });
  };

  const handleNextPeriod = () => {
    const start = parseDate(periodRange.start);
    const end = parseDate(periodRange.end);
    const newStart = new Date(start);
    const newEnd = new Date(end);
    newStart.setDate(start.getDate() + (periodData.length || 7));
    newEnd.setDate(end.getDate() + (periodData.length || 7));
    const today = new Date();
    if (newStart > today) return;
    setPeriodRange({
      start: formatDate(newStart),
      end: formatDate(newEnd),
    });
  };

  const handleQuickSelect = (days: number) => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - days + 1);
    setPeriodRange({
      start: formatDate(start),
      end: formatDate(today),
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Статистика за период</h2>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('average')}
              className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'average'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
            >
              В среднем
            </button>
            <button
              onClick={() => setViewMode('total')}
              className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'total'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
            >
              Всего
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Выбор периода</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPeriod}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextPeriod}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              aria-label="Next period"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Начальная дата
            </label>
            <input
              type="date"
              value={periodRange.start}
              onChange={(e) => setPeriodRange(prev => ({ ...prev, start: e.target.value }))}
              max={periodRange.end}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Конечная дата
            </label>
            <input
              type="date"
              value={periodRange.end}
              onChange={(e) => setPeriodRange(prev => ({ ...prev, end: e.target.value }))}
              min={periodRange.start}
              max={formatDate(new Date())}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickSelect(7)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors"
          >
            Неделя
          </button>
          <button
            onClick={() => handleQuickSelect(30)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors"
          >
            30 дней
          </button>
          <button
            onClick={() => handleQuickSelect(90)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors"
          >
            90 дней
          </button>
          <button
            onClick={() => {
              if (allDates.length > 0) {
                setPeriodRange({
                  start: allDates[0],
                  end: allDates[allDates.length - 1],
                });
              }
            }}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors"
          >
            Все время
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="text-sm text-blue-700 dark:text-blue-300">Калории</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{displayKBZHU.calories}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400">ккал</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-sm text-green-700 dark:text-green-300">Белки</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">{displayKBZHU.proteins}g</div>
          <div className="text-xs text-green-600 dark:text-green-400">гр</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="text-sm text-yellow-700 dark:text-yellow-300">Жиры</div>
          <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{displayKBZHU.fats}g</div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400">гр</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="text-sm text-purple-700 dark:text-purple-300">Углеводы</div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{displayKBZHU.carbs}g</div>
          <div className="text-xs text-purple-600 dark:text-purple-400">гр</div>
        </div>
      </div>

      {periodData.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
                labelStyle={{ color: '#cbd5e1' }}
              />
              <Bar dataKey="calories" name="Калории" fill="#3b82f6" />
              <Bar dataKey="proteins" name="Белки" fill="#10b981" />
              <Bar dataKey="fats" name="Жиры" fill="#f59e0b" />
              <Bar dataKey="carbs" name="Углеводы" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          Нет данных за выбранный период
        </div>
      )}
    </div>
  );
};