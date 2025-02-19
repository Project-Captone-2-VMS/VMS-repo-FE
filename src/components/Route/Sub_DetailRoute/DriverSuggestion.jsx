import React from "react";

const DriverSuggestion = ({
  license_plate,
  first_name,
  last_name,
  phone_number,
  capacity,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-gray-50 p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        DRIVER SUGGESTION
      </h2>
      <hr className="border-gray-200 mb-6" />

      <div className="flex">
        <div className="flex-1">
          <div className="mb-4">
            <span className="text-sm text-gray-500">Name</span>
            <p className="text-lg font-semibold text-gray-900">
              {first_name} {last_name}
            </p>
          </div>

          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg">
              {license_plate}
            </span>
          </div>

          <div className="flex mb-4">
            <div className="mr-4">
              <span className="text-sm text-gray-500">Weight</span>
              <p className="text-lg font-semibold text-gray-900">
                {capacity} ton
              </p>
            </div>
          </div>

          <div className="mb-4">
            <span className="text-sm text-gray-500">Phone number </span>
            <p className="text-lg font-semibold text-gray-900">
              {phone_number}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverSuggestion;
