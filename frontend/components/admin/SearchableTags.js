import { useState, useRef, useEffect } from 'react';

export default function SearchableTags({ allTags, selectedTags, onTagsChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter tags based on search term
  const filteredTags = allTags.filter(tag => 
    tag.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.includes(tag)
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle tag selection
  const handleTagSelect = (tag) => {
    onTagsChange([...selectedTags, tag]);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search tags..."
        className="w-full px-4 py-2 bg-card dark:bg-card-dark border border-border rounded-lg text-text dark:text-text-dark placeholder-text/50 dark:placeholder-text-dark/50"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsDropdownOpen(true);
        }}
        onFocus={() => setIsDropdownOpen(true)}
      />

      {/* Dropdown */}
      {isDropdownOpen && filteredTags.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-card dark:bg-card-dark border border-border rounded-lg shadow-custom max-h-60 overflow-y-auto"
        >
          {filteredTags.map(tag => (
            <button
              key={tag}
              className="w-full text-left px-4 py-2 text-text dark:text-text-dark hover:bg-background dark:hover:bg-background-dark transition-colors"
              onClick={() => handleTagSelect(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 