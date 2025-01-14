import React from 'react';

type StatusType = 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  status: string;
  type: StatusType;
}

const getStatusColor = (type: StatusType) => {
  switch (type) {
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'info':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(type)}`}>
      {status}
    </span>
  );
}