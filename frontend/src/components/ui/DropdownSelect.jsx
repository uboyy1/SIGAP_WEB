// Fungsi: Komponen UI reusable untuk kontrol input dan tampilan.
import { Children, useEffect, useRef, useState } from 'react';

const DropdownSelect = ({
  value,
  onChange,
  name,
  children,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  optionClassName = '',
  disabled = false,
  placeholder = ''
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const options = Children.toArray(children)
    .filter((child) => child?.props)
    .map((child) => ({
      label: child.props.children,
      value: child.props.value ?? child.props.children,
      disabled: Boolean(child.props.disabled)
    }));

  const selected = options.find((option) => String(option.value) === String(value)) || options[0];

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleSelect = (option) => {
    if (option.disabled) return;
    if (name) {
      onChange?.({ target: { name, value: option.value } });
    } else {
      onChange?.(option.value);
    }
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`h-10 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 px-3 text-xs text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors flex items-center justify-between gap-3 disabled:opacity-60 disabled:cursor-not-allowed ${buttonClassName}`}
      >
        <span className="truncate">{selected?.label || placeholder}</span>
        <svg className={`mr-1 w-4 h-4 shrink-0 text-gray-500 dark:text-gray-300 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className={`absolute left-0 right-0 top-full z-[1200] mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-xl ${menuClassName}`}>
          {options.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              disabled={option.disabled}
              onClick={() => handleSelect(option)}
              className={`w-full px-3 py-2 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${String(option.value) === String(value) ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60'} ${optionClassName}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownSelect;
