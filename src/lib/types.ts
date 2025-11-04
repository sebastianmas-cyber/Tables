export type TrainingPhase = 'prep' | 'hold' | 'recovery';

export type TrainingRound = {
  round: number;
  prep: number;

  hold: number;
  recovery: number;
};
