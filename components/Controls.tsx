
import React from 'react';
import { GameState } from '../types';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import ResetIcon from './icons/ResetIcon';

interface ControlsProps {
  gameState: GameState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const Controls: React.FC<ControlsProps> = ({ gameState, onStart, onPause, onReset, speed, onSpeedChange }) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg mt-6">
      <h3 className="text-xl font-bold text-center mb-4 text-white">CONTROLS</h3>
      <div className="flex justify-center items-center space-x-4">
        {gameState !== 'RUNNING' ? (
          <button onClick={onStart} className="bg-green-600 hover:bg-green-500 text-white font-bold p-3 rounded-full transition-transform transform hover:scale-105 shadow-lg flex items-center disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={gameState === 'FINISHED'}>
            <PlayIcon className="h-6 w-6" />
          </button>
        ) : (
          <button onClick={onPause} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold p-3 rounded-full transition-transform transform hover:scale-105 shadow-lg flex items-center">
            <PauseIcon className="h-6 w-6" />
          </button>
        )}
        <button onClick={onReset} className="bg-red-600 hover:bg-red-500 text-white font-bold p-3 rounded-full transition-transform transform hover:scale-105 shadow-lg flex items-center">
          <ResetIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="mt-6">
        <label htmlFor="speed-slider" className="block text-sm font-medium text-center text-slate-300 mb-2">
          Simulation Speed: {speed} ms/tick
        </label>
        <input
          id="speed-slider"
          type="range"
          min="50"
          max="1000"
          step="50"
          value={1050-speed}
          onChange={(e) => onSpeedChange(1050 - parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Controls;
