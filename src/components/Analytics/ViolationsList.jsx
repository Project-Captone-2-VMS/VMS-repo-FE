import React, { useState } from 'react';
import { Card,  CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "../../components/ui/select";
  import { Badge } from '../../components/ui/badge';
  import { 
    AlertTriangle, 
    Car, 
    MapPin, 
    Calendar,
    Camera,
    AlertCircle 
  } from 'lucide-react';
  import { VIOLATION_TYPES } from '../../components/Analytics/constants';
  
  const ViolationFilters = ({ filters, onChange }) => {
    return (
      <div className="flex flex-wrap gap-4">
        <Select
          value={filters.severity}
          onValueChange={(value) => onChange({ ...filters, severity: value })}
        >
          <SelectTrigger className="w-[130px] bg-gray-100 border-gray-300 hover:bg-gray-200 font-medium">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent className="bg-gray-50">
            <SelectItem className="hover:bg-gray-200 cursor-pointer" value="all">All Severity</SelectItem>
            <SelectItem className="hover:bg-gray-200 cursor-pointer" value="low">Low</SelectItem>
            <SelectItem className="hover:bg-gray-200 cursor-pointer" value="medium">Medium</SelectItem>
            <SelectItem className="hover:bg-gray-200 cursor-pointer" value="high">High</SelectItem>
          </SelectContent>
        </Select>
  
        <Select
          value={filters.type}
          onValueChange={(value) => onChange({ ...filters, type: value })}
        >
          <SelectTrigger className="w-[130px] bg-gray-100 border-gray-300 hover:bg-gray-200 font-medium">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-gray-50">
            <SelectItem className="hover:bg-gray-200 cursor-pointer" value="all">All Types</SelectItem>
            {Object.entries(VIOLATION_TYPES).map(([key, value]) => (
              <SelectItem 
                key={key} 
                value={value}
                className="hover:bg-gray-200 cursor-pointer"
              >
                {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
  
        <Select
          value={filters.status}
          onValueChange={(value) => onChange({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[130px] bg-gray-100 border-gray-300 hover:bg-gray-200 font-medium">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-50">
            <SelectItem className="hover:bg-gray-200 cursor-pointer" value="all">All Status</SelectItem>
            <SelectItem className="hover:bg-gray-200 cursor-pointer" value="pending">Pending</SelectItem>
            <SelectItem className="hover:bg-gray-200 cursor-pointer" value="reviewed">Reviewed</SelectItem>
            <SelectItem className="hover:bg-gray-200 cursor-pointer" value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };
  
  const ViolationCard = ({ violation }) => {
    const severityColors = {
      low: 'bg-yellow-100 text-yellow-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    };
  
    const statusColors = {
      pending: 'bg-gray-100 text-gray-800',
      reviewed: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800'
    };
  
    return (
      <div className="p-4 border rounded-lg bg-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-50 rounded-full">
              <Car className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h4 className="font-medium">{violation.driverName}</h4>
              <p className="text-sm text-gray-600">
                {violation.type.replace(/([A-Z])/g, ' $1').trim()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={severityColors[violation.severity]}>
              {violation.severity}
            </Badge>
            <Badge className={statusColors[violation.status]}>
              {violation.status}
            </Badge>
          </div>
        </div>
  
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {violation.location}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(violation.date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Evidence: {violation.evidence}
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {violation.description}
          </div>
        </div>
      </div>
    );
  };
  
  const ViolationsList = ({ violations }) => {
    const [filters, setFilters] = useState({
      severity: 'all',
      type: 'all',
      status: 'all'
    });
  
    const filteredViolations = violations.filter(violation => {
      if (filters.severity !== 'all' && violation.severity !== filters.severity) return false;
      if (filters.type !== 'all' && violation.type !== filters.type) return false;
      if (filters.status !== 'all' && violation.status !== filters.status) return false;
      return true;
    });
  
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Traffic Violations
          </CardTitle>
          <ViolationFilters filters={filters} onChange={setFilters} />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredViolations.map((violation, index) => (
              <ViolationCard key={index} violation={violation} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  export default ViolationsList;