import { LibraryItem } from '../../types';
import { generateShortId } from '../../utils/id';
import { hasNameCollision } from '../../utils/library';

interface SearchResultItemProps {
  item: LibraryItem;
  library: Record<string, LibraryItem>;
  onSelect: (item: LibraryItem) => void;
}

export const SearchResultItem = ({ item, library, onSelect }: SearchResultItemProps) => {
  const shortId = generateShortId(item.id);
  const collision = hasNameCollision(library, item.name);

  return (
    <button
      onClick={() => onSelect(item)}
      className="flex flex-col w-full px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      <div className="flex items-center font-medium text-slate-900 dark:text-slate-100">
        <span>{item.name}</span>
        {collision && (
          <span className="ml-1 text-xs text-slate-400 font-mono font-normal">
            #{shortId}
          </span>
        )}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
        {item.baseKBZHU.calories} ккал / 100 гр
      </div>
    </button>
  );
};