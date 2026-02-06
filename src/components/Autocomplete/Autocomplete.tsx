import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Input } from '../Input/Input';
import styles from './Autocomplete.module.css';
import { useDebounce } from '../../hooks/useDebounce';

interface AutocompleteProps<T extends { id: number; name: string }> {
  endpoint: string;
  queryParam?: string;
  onSelect: (item: T) => void;
  value?: string;
  label?: string;
  error?: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

export const Autocomplete = <T extends { id: number; name: string }>({
  endpoint,
  queryParam = 'name_like',
  onSelect,
  value = '',
  label,
  error,
  placeholder,
  id,
  disabled,
}: AutocompleteProps<T>) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debouncedInput = useDebounce(inputValue, 300);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedInput.length < 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);

    const url = `${endpoint}?${queryParam}=${encodeURIComponent(debouncedInput)}`;
    fetch(url, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to fetch'))))
      .then((data: T[]) => {
        setSuggestions(data);
        setIsOpen(data.length > 0);
        setHighlightedIndex(-1);
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          console.error('Autocomplete error:', err);
          setSuggestions([]);
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [debouncedInput, endpoint, queryParam]);

  const showList = isOpen && isFocused;

  const scrollToHighlighted = useCallback((index: number) => {
    listRef.current?.children[index]?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, []);

  const handleSelect = useCallback(
    (item: T) => {
      setInputValue(item.name);
      onSelect(item);
      setIsOpen(false);
      setHighlightedIndex(-1);
    },
    [onSelect]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showList) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = Math.min(highlightedIndex + 1, suggestions.length - 1);
        setHighlightedIndex(next);
        scrollToHighlighted(next);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = Math.max(highlightedIndex - 1, -1);
        setHighlightedIndex(prev);
        scrollToHighlighted(prev);
        break;
      }
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div className={styles.autocomplete}>
      <Input
        id={id}
        label={label}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          if (suggestions.length > 0) setIsOpen(true);
        }}
        onBlur={() => {
          setIsFocused(false);
          setTimeout(() => setIsOpen(false), 150);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={id ? `${id}-suggestions` : undefined}
      />
      {showList && (
        <ul
          ref={listRef}
          id={id ? `${id}-suggestions` : undefined}
          className={styles.suggestions}
          role="listbox"
        >
          {isLoading ? (
            <li className={styles.suggestionItem}>Loading...</li>
          ) : suggestions.length === 0 ? (
            <li className={styles.suggestionItem}>No results found</li>
          ) : (
            suggestions.map((item, index) => (
              <li
                key={item.id}
                className={`${styles.suggestionItem} ${index === highlightedIndex ? styles.highlighted : ''}`}
                role="option"
                aria-selected={index === highlightedIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
              >
                {item.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};
