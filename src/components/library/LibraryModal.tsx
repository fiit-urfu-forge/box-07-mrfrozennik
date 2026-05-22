import { useState, useMemo } from 'react';
import { LibraryItem } from '../../types';
import { SearchResultItem } from './SearchResultItem';
import { searchLibrary } from '../../utils/library';
import { Plus, X, Barcode } from 'lucide-react';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  library: Record<string, LibraryItem>;
  onSelectItem: (item: LibraryItem) => void;
  onAddManual: () => void;
  onScanBarcode: () => void;
}

export const LibraryModal = ({
  isOpen,
  onClose,
  library,
  onSelectItem,
  onAddManual,
  onScanBarcode,
}: LibraryModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    return searchLibrary(library, searchQuery);
  }, [library, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Библиотека продуктов</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Поиск по названию или штрихкоду..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="absolute left-3 top-3.5 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <button
              onClick={onScanBarcode}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Barcode className="w-5 h-5" />
              <span>Сканировать</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              {searchQuery ? 'Ничего не найдено' : 'Библиотека пуста'}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map(item => (
                <SearchResultItem
                  key={item.id}
                  item={item}
                  library={library}
                  onSelect={onSelectItem}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onAddManual}
            className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Добавить продукт вручную</span>
          </button>
        </div>
      </div>
    </div>
  );
};