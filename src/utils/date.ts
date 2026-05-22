export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const getWeekDates = (selectedDate: Date): Date[] => {
  const dayOfWeek = selectedDate.getDay(); // 0 - Sunday, 1 - Monday, etc.
  const start = new Date(selectedDate);
  // Если воскресенье (0), то понедельник на 6 дней назад, иначе на (dayOfWeek - 1) дней назад
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  start.setDate(selectedDate.getDate() + daysToMonday);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }
  return dates;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

export const isFuture = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateCopy = new Date(date);
  dateCopy.setHours(0, 0, 0, 0);
  return dateCopy > today;
};

export const getPreviousWeek = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() - 7);
  return newDate;
};

export const getNextWeek = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + 7);
  return newDate;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
};