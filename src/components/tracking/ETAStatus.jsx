import { CheckCircle, AlertOctagon, Clock } from 'lucide-react';

export const ETAStatus = ({ status, delay }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'ontime':
        return 'text-green-500';
      case 'delayed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ontime':
        return <CheckCircle className="h-5 w-5" />;
      case 'delayed':
        return <AlertOctagon className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      <span className="font-medium">
        {status === 'delayed' ? `Delayed by ${delay} minutes` : 'On Time'}
      </span>
    </div>
  );
};