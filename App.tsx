import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GridType, Team, GameState, GamePhase, Cell, Position } from './types';
import { GRID_SIZE, INITIAL_POINTS, TEAM_BLUE_START, TEAM_RED_START } from './constants';
import Grid from './components/Grid';
import Scoreboard from './components/Scoreboard';
import Controls from './components/Controls';
import EventLog from './components/EventLog';
import Brainstormer from './components/Brainstormer';

const createInitialGrid = (): GridType => {
  const grid: GridType = Array.from({ length: GRID_SIZE }, (_, row) =>
    Array.from({ length: GRID_SIZE }, (_, col) => ({
      id: `${row}-${col}`,
      owner: null,
      points: 0,
    }))
  );

  grid[TEAM_BLUE_START.row][TEAM_BLUE_START.col] = { ...grid[TEAM_BLUE_START.row][TEAM_BLUE_START.col], owner: Team.Blue, points: INITIAL_POINTS };
  grid[TEAM_RED_START.row][TEAM_RED_START.col] = { ...grid[TEAM_RED_START.row][TEAM_RED_START.col], owner: Team.Red, points: INITIAL_POINTS };
  return grid;
};

const App: React.FC = () => {
    const [grid, setGrid] = useState<GridType>(createInitialGrid);
    const [gameState, setGameState] = useState<GameState>('IDLE');
    const [gamePhase, setGamePhase] = useState<GamePhase>('EXPANSION');
    const [scores, setScores] = useState({ [Team.Blue]: INITIAL_POINTS, [Team.Red]: INITIAL_POINTS });
    const [eventLog, setEventLog] = useState<string[]>(["Simulation initialized."]);
    const [speed, setSpeed] = useState(500);
    const turnNumber = useRef(0);

    const addLog = useCallback((message: string) => {
        setEventLog(prev => [...prev.slice(-100), message]); // Keep log size manageable
    }, []);

    const runSimulationTurn = useCallback(() => {
        turnNumber.current++;
        setGrid(prevGrid => {
            let newGrid = JSON.parse(JSON.stringify(prevGrid));
            let newScores = { ...scores };
            let movesMade = false;

            if (gamePhase === 'EXPANSION') {
                const availableCells: { [key in Team]?: Position[] } = { [Team.Blue]: [], [Team.Red]: [] };
                
                for (let r = 0; r < GRID_SIZE; r++) {
                    for (let c = 0; c < GRID_SIZE; c++) {
                        if (newGrid[r][c].owner) {
                            const team = newGrid[r][c].owner as Team;
                            [[r-1, c], [r+1, c], [r, c-1], [r, c+1]].forEach(([nr, nc]) => {
                                if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && !newGrid[nr][nc].owner) {
                                     if (!availableCells[team]!.some(p => p.row === nr && p.col === nc)) {
                                       availableCells[team]!.push({ row: nr, col: nc });
                                    }
                                }
                            });
                        }
                    }
                }
                
                const blueExpansion = availableCells[Team.Blue]!.length > 0 ? availableCells[Team.Blue]![Math.floor(Math.random() * availableCells[Team.Blue]!.length)] : null;
                const redExpansion = availableCells[Team.Red]!.length > 0 ? availableCells[Team.Red]![Math.floor(Math.random() * availableCells[Team.Red]!.length)] : null;

                if (blueExpansion) {
                    const cell = newGrid[blueExpansion.row][blueExpansion.col];
                    cell.owner = Team.Blue;
                    cell.points = INITIAL_POINTS;
                    newScores[Team.Blue] += INITIAL_POINTS;
                    addLog(`${Team.Blue} expanded to (${blueExpansion.row}, ${blueExpansion.col}).`);
                    movesMade = true;
                }
                if (redExpansion && (blueExpansion ? (redExpansion.row !== blueExpansion.row || redExpansion.col !== blueExpansion.col) : true)) {
                    const cell = newGrid[redExpansion.row][redExpansion.col];
                    cell.owner = Team.Red;
                    cell.points = INITIAL_POINTS;
                    newScores[Team.Red] += INITIAL_POINTS;
                    addLog(`${Team.Red} team expanded to (${redExpansion.row}, ${redExpansion.col}).`);
                    movesMade = true;
                }

                if (!movesMade && gameState === 'RUNNING') {
                    setGamePhase('CONFLICT');
                    addLog("Expansion Phase Complete. Conflict Phase Begins!");
                }
            } else { // CONFLICT Phase
                const teamOrder = turnNumber.current % 2 === 0 ? [Team.Blue, Team.Red] : [Team.Red, Team.Blue];
                
                for(const team of teamOrder) {
                    const opponent = team === Team.Blue ? Team.Red : Team.Blue;
                    
                    // 1. Prioritize attacking
                    const possibleAttacks: { from: Position; to: Position }[] = [];
                    for (let r = 0; r < GRID_SIZE; r++) {
                        for (let c = 0; c < GRID_SIZE; c++) {
                            if (newGrid[r][c].owner === team) {
                                [[r-1, c], [r+1, c], [r, c-1], [r, c+1]].forEach(([nr, nc]) => {
                                    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && newGrid[nr][nc].owner === opponent && newGrid[r][c].points > newGrid[nr][nc].points) {
                                        possibleAttacks.push({ from: { row: r, col: c }, to: { row: nr, col: nc } });
                                    }
                                });
                            }
                        }
                    }

                    if (possibleAttacks.length > 0) {
                        const attack = possibleAttacks[Math.floor(Math.random() * possibleAttacks.length)];
                        const attacker = newGrid[attack.from.row][attack.from.col];
                        const defender = newGrid[attack.to.row][attack.to.col];
                        
                        const defenderPoints = defender.points;
                        const attackerPoints = attacker.points;

                        const newPointsOnCapturedCell = attackerPoints - defenderPoints;

                        // Update the captured cell
                        newGrid[attack.to.row][attack.to.col] = {
                             ...defender, 
                             owner: team,
                             points: newPointsOnCapturedCell,
                        };
                        
                        // The attacking cell is sacrificed and becomes neutral
                        newGrid[attack.from.row][attack.from.col] = { ...attacker, owner: null, points: 0 };

                        // Update scores
                        newScores[opponent] -= defenderPoints;
                        newScores[team] -= defenderPoints;
                        
                        addLog(`${team} sacrificed (${attack.from.row}, ${attack.from.col}) to capture (${attack.to.row}, ${attack.to.col}).`);
                        movesMade = true;
                        break; 
                    }

                    // 2. If no attack, try to reclaim neutral territory
                    const possibleReclaims: { from: Position; to: Position }[] = [];
                    for (let r = 0; r < GRID_SIZE; r++) {
                        for (let c = 0; c < GRID_SIZE; c++) {
                            if (newGrid[r][c].owner === team && newGrid[r][c].points > 1) {
                                [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([nr, nc]) => {
                                    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && newGrid[nr][nc].owner === null) {
                                        possibleReclaims.push({ from: { row: r, col: c }, to: { row: nr, col: nc } });
                                    }
                                });
                            }
                        }
                    }

                    if (possibleReclaims.length > 0) {
                        const reclaim = possibleReclaims[Math.floor(Math.random() * possibleReclaims.length)];
                        const sourceCell = newGrid[reclaim.from.row][reclaim.from.col];
                        const destCell = newGrid[reclaim.to.row][reclaim.to.col];

                        const pointsToMove = sourceCell.points - 1;
                        if (pointsToMove > 0) {
                            sourceCell.points = 1;
                            destCell.owner = team;
                            destCell.points = pointsToMove;
                            
                            addLog(`${team} reclaimed neutral territory at (${reclaim.to.row}, ${reclaim.to.col}).`);
                            movesMade = true;
                            break; 
                        }
                    }

                    // 3. If no attack or reclaim, try to consolidate points
                    const possibleConsolidations: { from: Position; to: Position[] }[] = [];
                    for (let r = 0; r < GRID_SIZE; r++) {
                        for (let c = 0; c < GRID_SIZE; c++) {
                            if (newGrid[r][c].owner === team && newGrid[r][c].points > 1) {
                                const friendlyNeighbors: Position[] = [];
                                [[r-1, c], [r+1, c], [r, c-1], [r, c+1]].forEach(([nr, nc]) => {
                                    if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && newGrid[nr][nc].owner === team) {
                                       friendlyNeighbors.push({ row: nr, col: nc });
                                    }
                                });
                                if (friendlyNeighbors.length > 0) {
                                    possibleConsolidations.push({ from: { row: r, col: c }, to: friendlyNeighbors });
                                }
                            }
                        }
                    }

                    if (possibleConsolidations.length > 0) {
                        const consolidation = possibleConsolidations[Math.floor(Math.random() * possibleConsolidations.length)];
                        const sourceCell = newGrid[consolidation.from.row][consolidation.from.col];
                        const destPos = consolidation.to[Math.floor(Math.random() * consolidation.to.length)];
                        
                        const pointsToMove = sourceCell.points - 1;
                        if (pointsToMove > 0) {
                            sourceCell.points = 1;
                            newGrid[destPos.row][destPos.col].points += pointsToMove;
                            addLog(`${team} consolidated ${pointsToMove} points from (${consolidation.from.row},${consolidation.from.col}) to (${destPos.row}, ${destPos.col}).`);
                            movesMade = true;
                            break;
                        }
                    }
                }

                if (!movesMade) {
                    setGameState('FINISHED');
                    addLog("Stalemate. No more moves possible. The simulation has ended.");
                }
            }

            setScores(newScores);
            return newGrid;
        });
    }, [gamePhase, scores, addLog, gameState]);

    useEffect(() => {
        if (gameState !== 'RUNNING') {
            return;
        }
        const timer = setTimeout(() => {
            runSimulationTurn();
        }, speed);

        return () => clearTimeout(timer);
    }, [gameState, grid, speed, runSimulationTurn]);

    const handleReset = () => {
        setGameState('IDLE');
        setGamePhase('EXPANSION');
        setGrid(createInitialGrid());
        setScores({ [Team.Blue]: INITIAL_POINTS, [Team.Red]: INITIAL_POINTS });
        setEventLog(["Simulation reset."]);
        turnNumber.current = 0;
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                    Grid War Simulation
                </h1>
                <p className="text-slate-400 mt-2">A strategic territory control simulator</p>
            </header>
            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                <div className="lg:col-span-2">
                    <Grid grid={grid} />
                </div>
                <div className="lg:col-span-1 flex flex-col space-y-6">
                    <Scoreboard scores={scores} gamePhase={gamePhase} isFinished={gameState === 'FINISHED'} />
                    <Controls 
                        gameState={gameState}
                        onStart={() => setGameState('RUNNING')}
                        onPause={() => setGameState('PAUSED')}
                        onReset={handleReset}
                        speed={speed}
                        onSpeedChange={setSpeed}
                    />
                    <EventLog events={eventLog} />
                    <Brainstormer />
                </div>
            </main>
        </div>
    );
};

export default App;