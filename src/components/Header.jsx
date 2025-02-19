import React from 'react';
import { Bell } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 bg-[#040D12] border-b flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold"></h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-200">
          <img className='logo' src='/src/assets/image/Avatar.jpg'></img>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-50 ">Jasmine Rose</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;