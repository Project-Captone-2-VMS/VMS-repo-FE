import { useState } from 'react';
import { Button } from "../../components/ui/button"; 
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';

const PerformanceChart = ({ data }) => {
  const [dateRange, setDateRange] = useState([0, 100]);
  const [activeMetrics, setActiveMetrics] = useState({
    attendance: true,
    deliveryTime: true,
    safetyScore: true,
    customerRating: true
  });

  const handleMetricToggle = (metric) => {
    setActiveMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(activeMetrics).map(([metric, active]) => (
          <Button
            key={metric}
            variant={active ? "default" : "outline"}
            onClick={() => handleMetricToggle(metric)}
            className="capitalize"
          >
            {metric.replace(/([A-Z])/g, ' $1').trim()}
          </Button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            content={({ active, payload }) => {
              if (!active || !payload) return null;
              return (
                <div className="bg-white p-4 rounded shadow-lg border">
                  {payload.map((entry, index) => (
                    <div key={index} className="flex justify-between gap-4">
                      <span className="font-semibold" style={{ color: entry.color }}>
                        {entry.name}:
                      </span>
                      <span>{entry.value}%</span>
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Legend 
            content={({ payload }) => (
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                {payload.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span>{entry.value}</span>
                  </div>
                ))}
              </div>
            )}
          />
          {activeMetrics.attendance && (
            <Line 
              type="monotone" 
              dataKey="attendance" 
              stroke="#4CAF50" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
          {activeMetrics.deliveryTime && (
            <Line 
              type="monotone" 
              dataKey="deliveryTime" 
              stroke="#2196F3" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
          {activeMetrics.safetyScore && (
            <Line 
              type="monotone" 
              dataKey="safetyScore" 
              stroke="#FFC107" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
          {activeMetrics.customerRating && (
            <Line 
              type="monotone" 
              dataKey="customerRating" 
              stroke="#9C27B0" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
          <Brush 
            dataKey="date" 
            height={30} 
            stroke="#8884d8"
            onChange={(range) => setDateRange(range)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
export default PerformanceChart;