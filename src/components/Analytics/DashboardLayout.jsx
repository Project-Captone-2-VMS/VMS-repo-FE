import React from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { CalendarIcon } from 'lucide-react';

const DashboardLayout = ({
  children,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear
}) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = ['2023', '2024', '2025'];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Driver Analytics Dashboard</h1>

        <div className="flex items-center gap-4 relative">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-500" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {months.map(month => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              {years.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="grid gap-6">
              {children}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardLayout;