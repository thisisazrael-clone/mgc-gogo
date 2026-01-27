import { Opponent } from '../models/opponent.model';

/**
 * Pure function to predict the opponent for a given match number.
 * Follows the pattern: opponents[(matchNumber - 1) % 7]
 * Skips dead opponents by finding the next alive opponent in sequence.
 * 
 * @param matchNumber The match number (1-based, must be >= 1)
 * @param opponents Array of 7 opponents in the order faced in matches 1-7
 * @returns The predicted opponent or null if all opponents are dead or invalid input
 */
export function predictOpponent(matchNumber: number, opponents: Opponent[]): Opponent | null {
  if (matchNumber < 1 || opponents.length !== 7) {
    return null;
  }

  const aliveOpponents = opponents.filter(opp => !opp.isDead);
  
  if (aliveOpponents.length === 0) {
    return null;
  }

  // Start with the base prediction
  let baseIndex = (matchNumber - 1) % 7;
  let attempts = 0;
  
  // Skip dead opponents by advancing to the next alive opponent
  while (opponents[baseIndex].isDead && attempts < 7) {
    baseIndex = (baseIndex + 1) % 7;
    attempts++;
  }
  
  return opponents[baseIndex].isDead ? null : opponents[baseIndex];
}

/**
 * Validates that all opponents in matches 1-7 are unique by name
 */
export function validateUniqueOpponents(opponents: Opponent[]): boolean {
  const names = opponents.map(opp => opp.name.toLowerCase().trim());
  return new Set(names).size === names.length;
}
