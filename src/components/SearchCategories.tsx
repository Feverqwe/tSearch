export interface SearchCategory {
  id?: number;
  label: string;
  count: number;
}

interface SearchCategoriesProps {
  categories: readonly SearchCategory[];
  selectedId?: number;
  onSelect: (id: number | undefined, button: HTMLButtonElement) => void;
}

export default function SearchCategories({
  categories,
  selectedId,
  onSelect,
}: SearchCategoriesProps) {
  return (
    <div className="categories">
      {categories.map(({id, count, label}) => {
        const selected = selectedId === id;
        if (!count && !selected) return null;

        return (
          <button
            key={id ?? 'all'}
            type="button"
            className="category"
            aria-pressed={selected}
            onClick={(event) => onSelect(id, event.currentTarget)}
          >
            {label} <span>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
