import { useState } from "react";
import { BiChevronDown } from "react-icons/bi";



const Select = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  showPlaceHolder = true,
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedValue(value);
    onChange(value);
  };

  return (
    <div className="relative w-full">
      <select
        className={`h-11   z w-full rounded-lg border appearance-none px-6 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90  dark:focus:border-brand-800  ${className}`}
        value={selectedValue}
        onChange={handleChange}
      >
        {showPlaceHolder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Chevron Icon */}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <BiChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>
    </div>
  );
};

export default Select;