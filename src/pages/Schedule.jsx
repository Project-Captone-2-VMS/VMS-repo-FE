import React, { useState, useEffect } from 'react';
import { Calendar, Modal, Radio, Badge } from 'antd';
import dayjs from 'dayjs';
import { MapPin, Clock, CalendarIcon, Navigation, TrendingUp } from 'lucide-react';
import { listRouteNoActive, getWayPoint, getInterConnections } from '../services/apiRequest';
import { toast } from 'react-hot-toast';

const Schedule = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [wayPoints, setWayPoints] = useState([]);
  const [interconnect, setInterconnect] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('month');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const listRoute = await listRouteNoActive();
        if (listRoute) {
          setRoutes(listRoute);
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
        toast.error('Failed to fetch routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const showRouteDetails = async (routeId) => {
    try {
      const wayPointsData = await getWayPoint(routeId);
      if (wayPointsData) {
        setWayPoints(wayPointsData);
      }

      const interconnectData = await getInterConnections(routeId);
      if (interconnectData) {
        setInterconnect(interconnectData);
      }
      
      const selectedRoute = routes.find(r => r.routeId === routeId);
      setSelectedRoute(selectedRoute);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching route details:', error);
      toast.error('Failed to fetch route details');
    }
  };

  const handleModeChange = (e) => {
    setViewMode(e.target.value);
  };

  const headerRender = ({ value, onChange }) => {
    const handleDateChange = (amount) => {
      const newDate = value.clone().add(amount, viewMode === 'month' ? 'month' : 'week');
      onChange(newDate);
      setSelectedDate(newDate);
    };

    let headerTitle = viewMode === 'month' ? 
      value.format('MMMM YYYY') :
      `${value.startOf('week').add(1, 'day').format('DD/MM')} - ${value.endOf('week').format('DD/MM/YYYY')}`;

    return (
      <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleDateChange(-1)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span className="text-xl font-semibold">{headerTitle}</span>
          <button 
            onClick={() => handleDateChange(1)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              const today = dayjs();
              onChange(today);
              setSelectedDate(today);
            }}
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            Today
          </button>
          <Radio.Group 
            value={viewMode} 
            onChange={handleModeChange}
            className="bg-white/20 rounded-lg p-1"
          >
            <Radio.Button value="month" className="text-white">Month</Radio.Button>
            <Radio.Button value="week" className="text-white">Week</Radio.Button>
          </Radio.Group>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const monday = selectedDate.startOf('week').add(1, 'day');

    return (
      <div className="flex-1 overflow-auto bg-white rounded-lg shadow-lg">
        <div>{headerRender({ value: selectedDate, onChange: setSelectedDate })}</div>
        <div className="grid grid-cols-7 gap-1 min-h-[calc(100vh-200px)]">
          {weekdays.map((day, index) => {
            const currentDate = monday.add(index, 'day');
            const dateStr = currentDate.format('YYYY-MM-DD');
            const routesForDay = routes.filter(route => 
              dayjs(route.routeDate).format('YYYY-MM-DD') === dateStr
            );

            return (
              <div key={day} className="border-r last:border-r-0">
                <div className="text-center p-3 bg-gray-50 border-b font-semibold">
                  {day}, {currentDate.format('D')}
                </div>
                <div className="p-3 min-h-[400px] flex flex-col gap-2">
                  {routesForDay.map(route => (
                    <div
                      key={route.routeId}
                      onClick={() => showRouteDetails(route.routeId)}
                      className="p-3 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all"
                      style={{
                        backgroundColor: route.status ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)',
                        borderLeft: `4px solid ${route.status ? '#52c41a' : '#ff4d4f'}`
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm font-semibold">
                          <Clock className="w-4 h-4 mr-2" />
                          {dayjs(route.routeTime, 'HH:mm:ss').format('HH:mm')}
                        </div>
                        <Badge status={route.status ? "success" : "error"} />
                      </div>
                      <div className="text-sm mt-1">
                        <div className="truncate">
                          <MapPin className="w-4 h-4 mr-2 inline" />
                          {route.startLocationName}
                        </div>
                        <div className="truncate">
                          <MapPin className="w-4 h-4 mr-2 inline" />
                          {route.endLocationName}
                        </div>
                      </div>
                      <div className="text-xs mt-1 text-gray-600">
                        <div>
                          <TrendingUp className="w-4 h-4 mr-2 inline" />
                          {(route.totalDistance / 1000).toFixed(1)} km
                        </div>
                        <div>
                          <Navigation className="w-4 h-4 mr-2 inline" />
                          {Math.floor(route.totalTime / 60)}h {route.totalTime % 60}m
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-gray-100 h-screen flex flex-col">
      <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden">
        {viewMode === 'month' ? (
          <Calendar
            mode="month"
            dateCellRender={(value) => {
              const date = value.format('YYYY-MM-DD');
              const routesForDay = routes.filter(route => 
                dayjs(route.routeDate).format('YYYY-MM-DD') === date
              );

              return (
                <div className="p-1 max-h-[120px] overflow-y-auto">
                  {routesForDay.map(route => (
                    <div
                      key={route.routeId}
                      onClick={() => showRouteDetails(route.routeId)}
                      className="mb-1 p-1 rounded-lg cursor-pointer hover:shadow-md transition-all text-xs"
                      style={{
                        backgroundColor: route.status ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)',
                        borderLeft: `3px solid ${route.status ? '#52c41a' : '#ff4d4f'}`
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center font-semibold">
                          <Clock className="w-3 h-3 mr-1" />
                          {dayjs(route.startTime, 'HH:mm:ss').format('HH:mm')}
                        </div>
                        <Badge status={route.status ? "success" : "error"} />
                      </div>
                      <div className="mt-1">
                        <div className="truncate">
                          <MapPin className="w-3 h-3 mr-1 inline" />
                          {route.startLocationName}
                        </div>
                        <div className="truncate">
                          <MapPin className="w-3 h-3 mr-1 inline" />
                          {route.endLocationName}
                        </div>
                      </div>
                      <div className="mt-1 text-gray-600">
                        <div>
                          <TrendingUp className="w-3 h-3 mr-1 inline" />
                          {(route.totalDistance / 1000).toFixed(1)} km
                        </div>
                        <div>
                          <Navigation className="w-3 h-3 mr-1 inline" />
                          {Math.floor(route.totalTime / 60)}h {route.totalTime % 60}m
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            }}
            headerRender={headerRender}
            className="calendar-custom"
          />
        ) : (
          renderWeekView()
        )}
      </div>

      <Modal
        title={<div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Route Details</div>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
        className="route-details-modal"
      >
        {selectedRoute && (
          <div className="space-y-6 p-4">
            <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Route Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start">
                  <MapPin className="w-6 h-6 mr-3 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1 font-semibold">Origin</p>
                    <p className="font-medium text-gray-800 mb-3">{selectedRoute.startLocationName}</p>
                    <p className="text-sm text-gray-600 mb-1 font-semibold">Destination</p>
                    <p className="font-medium text-gray-800">{selectedRoute.endLocationName}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CalendarIcon className="w-6 h-6 mr-3 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1 font-semibold">Departure Date</p>
                    <p className="font-medium text-gray-800">
                      {dayjs(selectedRoute.routeDate).format('DD/MM/YYYY')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="w-6 h-6 mr-3 text-orange-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1 font-semibold">Departure Time</p>
                    <p className="font-medium text-gray-800">
                      {dayjs(selectedRoute.routeTime, 'HH:mm:ss').format('HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Navigation className="w-6 h-6 mr-3 text-purple-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1 font-semibold">Total Time</p>
                    <p className="font-medium text-gray-800">
                      {Math.floor(selectedRoute.totalTime / 60)}h {selectedRoute.totalTime % 60}m
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <TrendingUp className="w-6 h-6 mr-3 text-red-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1 font-semibold">Total Distance</p>
                    <p className="font-medium text-gray-800">
                      {(selectedRoute.totalDistance / 1000).toFixed(1)} km
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className={`w-6 h-6 mr-3 rounded-full ${selectedRoute.status ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} flex items-center justify-center mt-1 text-lg`}>
                    {selectedRoute.status ? '✓' : '○'}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1 font-semibold">Status</p>
                    <p className="font-medium" style={{ color: selectedRoute.status ? '#52c41a' : '#ff4d4f' }}>
                      {selectedRoute.status ? 'Completed' : 'Not Completed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {wayPoints.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h4 className="font-bold text-lg mb-4 flex items-center text-gray-800">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Waypoints
                </h4>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Location</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Time</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Distance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {wayPoints.map((waypoint, index) => (
                        <tr key={waypoint.waypointId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">
                                {waypoint.sequence}
                              </div>
                              <span className="font-medium text-gray-800">{waypoint.locationName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-800">
                            {interconnect[index]?.timeWaypoint 
                              ? `${Math.floor(interconnect[index].timeWaypoint / 60)}h ${interconnect[index].timeWaypoint % 60}m` 
                              : '-'}
                          </td>
                          <td className="px-6 py-4 text-gray-800">
                            {interconnect[index]?.distance 
                              ? `${(interconnect[index].distance / 1000).toFixed(1)} km` 
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .ant-picker-calendar-header {
          display: none;
        }
        .ant-picker-panel {
          border: none !important;
          height: 100%;
        }
        .ant-picker-cell-selected .ant-picker-cell-inner {
          background: #e6f7ff !important;
          color: #1890ff !important;
        }
        .ant-picker-calendar-date-today {
          border: 2px solid #1890ff !important;
        }
        .route-details-modal .ant-modal-content {
          border-radius: 16px;
          padding: 0;
        }
        .route-details-modal .ant-modal-header {
          border-bottom: none;
          padding: 24px;
        }
        .ant-radio-button-wrapper {
          border: none !important;
        }
        .ant-radio-button-wrapper-checked {
          background: #ffffff !important;
          color: #1890ff !important;
        }
        .calendar-custom .ant-picker-calendar-date-content {
          height: 120px !important;
          overflow-y: auto;
        }
        .ant-picker-calendar {
          max-height:
        }
      `}</style>
    </div>
  );
}
export default Schedule;