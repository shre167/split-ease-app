import React from 'react';

const filters = ['All', 'Sent', 'Received'];

type Props = {
  selected: string;
  onSelect: (filter: string) => void;
};

const FilterChips: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div className="flex gap-2 my-4 overflow-x-auto">
      {filters.map((filter) => (
        <button
          key={filter}
          className={`px-4 py-1 text-sm rounded-full border ${
            selected === filter
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => onSelect(filter)}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default FilterChips;
