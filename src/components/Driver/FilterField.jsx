// components/FilterField.jsx
const FilterField = ({ label, name, value, onChange, type = "text", options = null }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
  