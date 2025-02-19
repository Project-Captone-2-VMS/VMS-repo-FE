import React, { useState } from 'react';

import DashboardLayout from '../../components/Analytics/DashboardLayout';
import  PerformanceChart  from '../../components/Analytics/PerformanceChart.jsx';
import  ViolationsList  from '../../components/Analytics/ViolationsList';
import  RewardsTracking  from '../../components/Analytics/RewardsTracking';
import {useDriverAnalytics} from '../../components/Analytics/useDriverAnalytics.js';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const Analytics = () => {
    const [selectedMonth, setSelectedMonth] = useState('January');
    const [selectedYear, setSelectedYear] = useState('2024');
    const { driverData, loading } = useDriverAnalytics(selectedMonth, selectedYear);
  
    if (loading) {
      return <LoadingSpinner />;
    }
  
    return (
      <DashboardLayout
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      >
        <div className="space-y-6">
          <PerformanceChart data={driverData.performance} />
          <div className="grid md:grid-cols-2 gap-6">
            <ViolationsList violations={driverData.violations} />
            <RewardsTracking rewards={driverData.rewards} />
          </div>
        </div>
      </DashboardLayout>
    );
  };
  
  export default Analytics;