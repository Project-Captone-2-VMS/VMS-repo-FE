import React, { useState } from 'react'
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

const FilterIncident = ({ onApplyFilters }) => {
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
    driverId: '',
    vehicleId: ''
  })

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleApplyFilters = () => {
    onApplyFilters(filters)
  }

  return (
    <div className="mb-6 p-4 border rounded-lg bg-muted">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          value={filters.type}
          onValueChange={(value) => handleFilterChange('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACCIDENT">Accident</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="VIOLATION">Violation</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          type="datetime-local"
          placeholder="Start Date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
        />
        
        <Input
          type="datetime-local"
          placeholder="End Date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
        />
        
        <Input
          type="number"
          placeholder="Driver ID"
          value={filters.driverId}
          onChange={(e) => handleFilterChange('driverId', e.target.value)}
        />
        
        <Input
          type="number"
          placeholder="Vehicle ID"
          value={filters.vehicleId}
          onChange={(e) => handleFilterChange('vehicleId', e.target.value)}
        />
        
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </div>
    </div>
  )
}

export default FilterIncident;