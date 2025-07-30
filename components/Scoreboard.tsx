
import React from 'react';
import { Team } from '../types';

interface ScoreboardProps {
  scores: { [key in Team]: number };
  gamePhase: string;
  isFinished: boolean;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ scores, gamePhase, isFinished }) => {
    const winner = scores[Team.Blue] > scores[Team.Red] ? Team.Blue : Team.Red;

    return (
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-4 text-white tracking-wider">SCOREBOARD</h2>
            <div className="flex justify-around items-center text-center">
                <div className="p-4 rounded-lg bg-blue-900/50 border border-blue-700 w-1/2 mr-2">
                    <div className="text-lg font-semibold text-blue-300">Team Blue</div>
                    <div className="text-4xl font-black text-blue-200 tracking-tighter">{scores[Team.Blue]}</div>
                </div>
                <div className="p-4 rounded-lg bg-red-900/50 border border-red-700 w-1/2 ml-2">
                    <div className="text-lg font-semibold text-red-300">Team Red</div>
                    <div className="text-4xl font-black text-red-200 tracking-tighter">{scores[Team.Red]}</div>
                </div>
            </div>
            <div className="text-center mt-4 text-slate-400">
                <p>Game Phase: <span className="font-semibold text-cyan-300">{gamePhase}</span></p>
                {isFinished && (
                    <p className={`mt-2 text-xl font-bold ${winner === Team.Blue ? 'text-blue-400' : 'text-red-400'}`}>
                        {winner} Team is Victorious!
                    </p>
                )}
            </div>
        </div>
    );
};

export default Scoreboard;
