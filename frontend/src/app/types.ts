export interface ChatMessage {
  username: string;
  message: string;
}

export interface Player {
  name: string;
  score: number;
  gameMaster?: boolean;
}

export interface DrawingLine {
  x: number;
  y: number;
  color: string;
  newLine: boolean;
}
