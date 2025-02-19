// components/SearchAndFilter.jsx
import React from "react";
import { Search, Filter } from "lucide-react";
import FilterField from "./FilterField";
import { FILTER_OPTIONS } from "./FilterOptions";

const SearchAndFilter = ({
  searchTerm,
  onSearchChange,
  showFilters,
  setShowFilters,
  filters,
  onFilterChange,
}) => (
  <div className="mb-6 px-1 rounded-lg bg-white p-4 ">
    <div className=" flex gap-4 px-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search drivers..."
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter className="h-5 w-5" />
        Filters
      </button>
    </div>
    {showFilters && (
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FilterField
            label="Status"
            name="status"
            value={filters.status}
            onChange={onFilterChange}
            options={FILTER_OPTIONS.status}
          />
          <FilterField
            label="Work Schedule"
            name="workSchedule"
            value={filters.workSchedule}
            onChange={onFilterChange}
            options={FILTER_OPTIONS.workSchedule}
          />
        </div>
      </div>
    )}
  </div>
);

export default SearchAndFilter;
