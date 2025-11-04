export type TrainingPhase = 'prep' | 'hold' | 'recovery';

export type TrainingRound = {
  round: number;
  prep: number;
  hold: number;
  recovery: number; // This is now implicit, but kept for type consistency
};
