import { useState, useEffect } from 'react';
import { formatDate, getWeekDates, isToday, isFuture, isSameDay, getPreviousWeek, getNextWeek } from '../utils/date';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayNavigationProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const DayNavigation = ({ selectedDate, onDateSelect }: DayNavigationProps) => {
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const weekDates = getWeekDates(selectedDate);
    return weekDates[0];
  });

  const weekDates = getWeekDates(weekStart);
  const today = new Date();
  const currentWeekMonday = getWeekDates(today)[0];
  
  const handlePreviousWeek = () => {
    setWeekStart(prev => getPreviousWeek(prev));
  };

  const handleNextWeek = () => {
    const nextWeekStart = getNextWeek(weekStart);
    if (nextWeekStart <= currentWeekMonday) {
      setWeekStart(nextWeekStart);
    }
  };

  const handleDayClick = (date: Date) => {
    if (isFuture(date) && !isSameDay(date, today)) return;
    onDateSelect(date);
  };

  useEffect(() => {
    const newWeekStart = getWeekDates(selectedDate)[0];
    if (!isSameDay(newWeekStart, weekStart)) {
      setWeekStart(newWeekStart);
    }
  }, [selectedDate]);

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow">
      <div className="flex items-center justify-between w-full">
        <button
          onClick={handlePreviousWeek}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          {weekStart.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })} • Неделя
        </div>
        <button
          onClick={handleNextWeek}
          disabled={weekStart >= currentWeekMonday}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next week"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="flex space-x-2">
        {weekDates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const future = isFuture(date) && !isToday(date);
          const todayFlag = isToday(date);
          return (
            <button
              key={formatDate(date)}
              onClick={() => handleDayClick(date)}
              disabled={future}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all ${isSelected
                  ? 'bg-blue-500 text-white'
                  : todayFlag
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                } ${future ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200 dark:hover:bg-slate-600'}`}
            >
              <div className="text-xs font-medium">{dayNames[index]}</div>
              <div className="text-lg font-bold">{date.getDate()}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};