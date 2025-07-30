
import React, { useState } from 'react';
import { getBrainstormingIdeas } from '../services/geminiService';
import { BrainstormIdea } from '../types';
import SparklesIcon from './icons/SparklesIcon';

const Brainstormer: React.FC = () => {
    const [ideas, setIdeas] = useState<BrainstormIdea[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleBrainstormClick = async () => {
        setIsLoading(true);
        setError(null);
        setIdeas([]);
        try {
            const result = await getBrainstormingIdeas();
            setIdeas(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
            case 'new mechanic': return 'bg-purple-500 text-purple-100';
            case 'special unit': return 'bg-green-500 text-green-100';
            case 'winning condition': return 'bg-yellow-500 text-yellow-100';
            default: return 'bg-gray-500 text-gray-100';
        }
    }

    return (
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg mt-6">
            <h3 className="text-xl font-bold text-center mb-4 text-white">Game Idea Brainstormer</h3>
            <p className="text-center text-slate-400 mb-4">Use Gemini to generate new ideas for this game!</p>
            <button
                onClick={handleBrainstormClick}
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 disabled:cursor-wait text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </>
                ) : (
                    <>
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Brainstorm New Ideas
                    </>
                )}
            </button>
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            <div className="mt-6 space-y-4">
                {ideas.map((idea, index) => (
                    <div key={index} className="bg-slate-900/70 p-4 rounded-lg border border-slate-700 transition-shadow hover:shadow-xl">
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="text-lg font-bold text-cyan-300">{idea.title}</h4>
                             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(idea.category)}`}>{idea.category}</span>
                        </div>
                        <p className="text-slate-300">{idea.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Brainstormer;
