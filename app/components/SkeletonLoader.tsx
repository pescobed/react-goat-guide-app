import React from "react";

interface SkeletonLoaderProps {
  rows?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-pulse space-y-4">
      {/* Table Header Placeholder */}
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>

      {/* Rows Placeholder */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center space-x-4">
            <div className="h-4 bg-gray-200 rounded w-1/12"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;