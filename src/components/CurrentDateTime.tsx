import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CurrentDateTime: React.FC = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-xl text-xs font-medium text-muted-foreground">
      <Clock size={14} className="text-primary" />
      <span>Brasília: {formatDate(dateTime)} - {formatTime(dateTime)}</span>
    </div>
  );
};

export default CurrentDateTime;
