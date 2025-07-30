import React from 'react';
import { Cell, Team } from '../types';

interface GridCellProps {
  cell: Cell;
}

const GridCell: React.FC<GridCellProps> = ({ cell }) => {
  const baseClasses = "relative w-full h-full flex items-center justify-center font-bold text-lg transition-colors duration-500 ease-in-out";
  
  const getTeamClasses = () => {
    switch (cell.owner) {
      case Team.Blue:
        return 'bg-blue-800/80 text-blue-100 border-blue-600';
      case Team.Red:
        return 'bg-red-800/80 text-red-100 border-red-600';
      default:
        return 'bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className={`${baseClasses} ${getTeamClasses()} border`}>
      {cell.points > 0 ? cell.points : ''}
    </div>
  );
};

export default React.memo(GridCell);