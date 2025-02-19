const FilterField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  options = null,
}) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">
      {label}
    </label>
    {options ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : type === "checkbox" ? (
      <div className="flex items-center">
        <input
          type="checkbox"
          name={name}
          checked={value}
          onChange={onChange}
          className="mr-2 h-4 w-4 rounded border focus:ring-blue-500"
        />
        <span>{label}</span>
      </div>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
      />
    )}
  </div>
);

export default FilterField;
