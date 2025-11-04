import type { TrainingRound } from './types';

const NUM_ROUNDS = 8;
const PREP_TIME = 120; // 2 minutes

/**
 * Generates a CO2 tolerance table.
 * Constant hold time, decreasing recovery time.
 * @param personalBestInSeconds The user's personal best breath-hold time in seconds.
 * @returns An array of training rounds.
 */
export function generateCo2Table(personalBestInSeconds: number): TrainingRound[] {
  const table: TrainingRound[] = [];
  const holdTime = Math.round(personalBestInSeconds * 0.5);
  let recoveryTime = PREP_TIME;

  for (let i = 1; i <= NUM_ROUNDS; i++) {
    table.push({
      round: i,
      prep: PREP_TIME,
      hold: holdTime,
      recovery: i === NUM_ROUNDS ? 0 : recoveryTime,
    });
    // Decrease recovery time for the next round, with a minimum of 15 seconds.
    if (recoveryTime > 15) {
      recoveryTime -= 15;
    }
  }

  return table;
}

/**
 * Generates an O2 tolerance table.
 * Increasing hold time, constant recovery time.
 * @param personalBestInSeconds The user's personal best breath-hold time in seconds.
 * @returns An array of training rounds.
 */
export function generateO2Table(personalBestInSeconds: number): TrainingRound[] {
  const table: TrainingRound[] = [];
  let holdTime = Math.round(personalBestInSeconds * 0.5);
  const recoveryTime = PREP_TIME;

  for (let i = 1; i <= NUM_ROUNDS; i++) {
    table.push({
      round: i,
      prep: PREP_TIME,
      hold: holdTime,
      recovery: i === NUM_ROUNDS ? 0 : recoveryTime,
    });
    // Increase hold time for the next round
    holdTime += 10;
  }
  
  return table;
}
