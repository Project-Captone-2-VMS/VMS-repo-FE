import React from 'react';

import PropTypes from 'prop-types';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  onPageChange 
}) => {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="text-sm text-gray-700">
        Showing {currentPage} of {totalPages} pages (Total items: {totalItems})
      </div>
      <div className="flex gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
          <button
            key={pageNumber}
            className={`px-4 py-2 rounded-lg ${
              pageNumber === currentPage
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;