import { useState, useEffect } from 'react';
import { generateDriverData } from '../../components/Analytics/mockDataGenerator';

export const useDriverAnalytics = (selectedMonth, selectedYear) => {
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // In production, this would be an API call
      const data = await generateDriverData(selectedMonth, selectedYear);
      setDriverData(data);
      setLoading(false);
    };

    fetchData();
  }, [selectedMonth, selectedYear]);

  return { driverData, loading };
};