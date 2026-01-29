import { Opponent } from '../models/opponent.model';

/**
 * Pure function to predict the opponent for a given match number.
 * If lastOpponentId is provided, advances circularly from that opponent to the next alive one.
 * Otherwise, follows the pattern: opponents[(matchNumber - 1) % 7]
 * Skips dead opponents by finding the next alive opponent in sequence.
 * 
 * @param matchNumber The match number (1-based, must be >= 1)
 * @param opponents Array of 7 opponents in the order faced in matches 1-7
 * @param lastOpponentId Optional ID of the last opponent faced (for circular advancement)
 * @returns The predicted opponent or null if all opponents are dead or invalid input
 */
export function predictOpponent(matchNumber: number, opponents: Opponent[], lastOpponentId?: string): Opponent | null {
  if (matchNumber < 1 || opponents.length !== 7) {
    return null;
  }

  const aliveOpponents = opponents.filter(opp => !opp.isDead);
  
  if (aliveOpponents.length === 0) {
    return null;
  }

  let baseIndex: number;
  
  // If we have a last opponent ID, find them and advance to the next alive opponent
  if (lastOpponentId) {
    const lastIndex = opponents.findIndex(opp => opp.id === lastOpponentId);
    if (lastIndex !== -1) {
      // Start from the next opponent after the last one faced
      baseIndex = (lastIndex + 1) % 7;
      let attempts = 0;
      
      // Skip dead opponents by advancing to the next alive opponent
      while (opponents[baseIndex].isDead && attempts < 7) {
        baseIndex = (baseIndex + 1) % 7;
        attempts++;
      }
      
      return opponents[baseIndex].isDead ? null : opponents[baseIndex];
    }
  }
  
  // Fallback to base prediction for first prediction after match 7
  baseIndex = (matchNumber - 1) % 7;
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
