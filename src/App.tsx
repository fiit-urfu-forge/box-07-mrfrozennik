import { useState, useEffect } from 'react';
import { DayNavigation } from './components/DayNavigation';
import { Diary } from './components/diary/Diary';
import { DayStatistics } from './components/statistics/DayStatistics';
import { PeriodStatistics } from './components/statistics/PeriodStatistics';
import { ExportImport } from './components/ExportImport';
import { Settings as SettingsComponent } from './components/Settings';
import { useAppStore } from './store/useAppStore';
import { formatDate } from './utils/date';
import { Settings, BarChart3, Home, Download } from 'lucide-react';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'diary' | 'stats' | 'export'>('diary');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Достаем initializeDay из хука
  const { state, getDayRecord, calculateDayKBZHU, initializeDay } = useAppStore();
  const selectedDateStr = formatDate(selectedDate);

  // Инициализируем день безопасно
  useEffect(() => {
    initializeDay(selectedDateStr);
  }, [selectedDateStr, initializeDay]);

  const dayRecord = getDayRecord(selectedDateStr);
  const dayKBZHU = calculateDayKBZHU(selectedDateStr);

  

  // Auto-switch to current day at midnight
  useEffect(() => {
    const updateCurrentDate = () => {
      const now = new Date();
      if (formatDate(now) !== selectedDateStr) {
        setSelectedDate(now);
      }
    };

    const interval = setInterval(updateCurrentDate, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [selectedDateStr]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Трекер питания</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Отслеживайте КБЖУ и достигайте целей</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {selectedDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <DayNavigation
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        <div className="mt-8">
          <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('diary')}
              className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${activeTab === 'diary'
                  ? 'bg-white dark:bg-slate-800 border-t border-l border-r border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <Home className="inline-block w-4 h-4 mr-2" />
              Дневник питания
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${activeTab === 'stats'
                  ? 'bg-white dark:bg-slate-800 border-t border-l border-r border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <BarChart3 className="inline-block w-4 h-4 mr-2" />
              Статистика
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${activeTab === 'export'
                  ? 'bg-white dark:bg-slate-800 border-t border-l border-r border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              <Download className="inline-block w-4 h-4 mr-2" />
              Экспорт/Импорт
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-b-lg p-6">
            {activeTab === 'diary' && (
              <Diary
                date={selectedDateStr}
                dayRecord={dayRecord}
                library={state.library}
              />
            )}

            {activeTab === 'stats' && (
              <div className="space-y-8">
                <DayStatistics
                  dayKBZHU={dayKBZHU}
                  targetKBZHU={state.settings.targetKBZHU}
                />
                <PeriodStatistics
                  records={state.records}
                  calculateDayKBZHU={calculateDayKBZHU}
                />
              </div>
            )}

            {activeTab === 'export' && <ExportImport />}
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-slate-200 dark:border-slate-700 py-6">
        <div className="container mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>Трекер питания • Данные хранятся локально в вашем браузере</p>
          <p className="mt-2">Для обратной связи и предложений: <a href="mailto:example@example.com" className="text-blue-500 hover:underline">example@example.com</a></p>
        </div>
      </footer>

      <SettingsComponent
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;