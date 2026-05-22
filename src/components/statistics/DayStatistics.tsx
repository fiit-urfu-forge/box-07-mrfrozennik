import { KBZHU } from '../../types';
import { calculateMacroPercentages } from '../../utils/kbzhu';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DayStatisticsProps {
  dayKBZHU: KBZHU;
  targetKBZHU?: KBZHU;
}

export const DayStatistics = ({ dayKBZHU, targetKBZHU }: DayStatisticsProps) => {
  const percentages = calculateMacroPercentages(dayKBZHU);
  const pieData = [
    { name: 'Белки', value: percentages.proteins, color: '#10b981' },
    { name: 'Жиры', value: percentages.fats, color: '#f59e0b' },
    { name: 'Углеводы', value: percentages.carbs, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  const totalCalories = dayKBZHU.calories;
  const targetCalories = targetKBZHU?.calories || 2000;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Статистика за день</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Распределение калорий</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Доля']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Калории</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Потреблено</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{totalCalories} ккал</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Цель</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{targetCalories} ккал</span>
              </div>
              <div className="pt-2">
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min((totalCalories / targetCalories) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-right">
                  {Math.round((totalCalories / targetCalories) * 100)}%
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Макронутриенты</h3>
            <div className="space-y-4">
              {[
                { label: 'Белки', value: dayKBZHU.proteins, target: targetKBZHU?.proteins, color: 'bg-green-500' },
                { label: 'Жиры', value: dayKBZHU.fats, target: targetKBZHU?.fats, color: 'bg-yellow-500' },
                { label: 'Углеводы', value: dayKBZHU.carbs, target: targetKBZHU?.carbs, color: 'bg-purple-500' },
              ].map(({ label, value, target, color }) => (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{label}</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {value}g {target && ` / ${target}g`}
                    </span>
                  </div>
                  {target && (
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full`}
                        style={{ width: `${Math.min((value / target) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};