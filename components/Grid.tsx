
import React from 'react';
import { GridType } from '../types';
import GridCell from './GridCell';

interface GridProps {
  grid: GridType;
}

const Grid: React.FC<GridProps> = ({ grid }) => {
  return (
    <div className="aspect-square w-full max-w-lg mx-auto bg-slate-900 border-2 border-slate-700 rounded-lg shadow-2xl p-2">
      <div className="grid grid-cols-10 grid-rows-10 gap-0 h-full w-full">
        {grid.flat().map((cell) => (
          <GridCell key={cell.id} cell={cell} />
        ))}
      </div>
    </div>
  );
};

export default Grid;
