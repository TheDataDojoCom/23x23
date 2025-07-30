export enum Team {
  Blue = 'Blue',
  Red = 'Red',
}

export interface Cell {
  id: string;
  owner: Team | null;
  points: number;
}

export type GridType = Cell[][];

export type GameState = 'IDLE' | 'RUNNING' | 'PAUSED' | 'FINISHED';
export type GamePhase = 'EXPANSION' | 'CONFLICT';

export interface Position {
  row: number;
  col: number;
}

export interface BrainstormIdea {
    title: string;
    description: string;
    category: string;
}