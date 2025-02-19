import React from "react";
import { Filter, Search } from "lucide-react";
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
  <div className="mb-6">
    <div className="mb-4 flex gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by warehouse name or location..." // You can remove this if search is no longer needed.
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
          {/* Utilization filter */}
          <FilterField
            label="Utilization"
            name="utilizationRate"
            value={filters.utilizationRate}
            onChange={onFilterChange}
            options={FILTER_OPTIONS.utilizationRate}
          />
          {/* Capacity filters */}
          <FilterField
            label="Capacity > 10,000"
            name="capacityGreaterThan10000"
            value={filters.capacityGreaterThan10000}
            onChange={onFilterChange}
            type="checkbox"
          />
          <FilterField
            label="Capacity < 10,000"
            name="capacityLessThan10000"
            value={filters.capacityLessThan10000}
            onChange={onFilterChange}
            type="checkbox"
          />
        </div>
      </div>
    )}
  </div>
);

export default SearchAndFilter;
