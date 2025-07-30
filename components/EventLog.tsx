
import React, { useRef, useEffect } from 'react';
import { Team } from '../types';

interface EventLogProps {
  events: string[];
}

const EventLog: React.FC<EventLogProps> = ({ events }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [events]);

  const renderEvent = (event: string, index: number) => {
    let colorClass = 'text-slate-400';
    if (event.includes(Team.Blue)) {
        colorClass = 'text-blue-400';
    } else if (event.includes(Team.Red)) {
        colorClass = 'text-red-400';
    } else if (event.toLowerCase().includes('phase')) {
        colorClass = 'text-yellow-400 font-semibold';
    }


    return (
        <p key={index} className={`py-1 px-2 text-sm ${colorClass} font-mono`}>
            {`> ${event}`}
        </p>
    )
  }

  return (
    <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg mt-6 h-48 flex flex-col">
      <h3 className="text-lg font-bold text-center mb-2 text-white flex-shrink-0">EVENT LOG</h3>
      <div ref={logContainerRef} className="flex-grow overflow-y-auto bg-slate-900/70 rounded p-2">
        {events.map(renderEvent)}
      </div>
    </div>
  );
};

export default EventLog;
