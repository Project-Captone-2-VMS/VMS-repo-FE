export const TabNavigation = ({ activeTab, setActiveTab }) => {
    const tabs = [
      { id: 'overview', label: 'Over view', icon: '🚚' },
      { id: 'vehicle', label: 'Vehicle', icon: '🚛' },
      { id: 'maintenance', label: 'Maintenance', icon: '⚙️' },
    //   { id: 'schedule', label: 'Schedule', icon: '📅' },
    ];
  
    return (
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    );
  };