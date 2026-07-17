import { randomInt } from 'node:crypto';

// Ambiguity-free alphabets (no O/0, I/l/1) so a generated password is easy to read aloud.
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnpqrstuvwxyz';
const DIGIT = '23456789';
const SYMBOL = '@#$%&*!?';

const pick = (set: string) => set[randomInt(set.length)];

/** Cryptographically-random temp password with at least one of each class. */
export function generatePassword(length = 14): string {
  const all = UPPER + LOWER + DIGIT + SYMBOL;
  const chars = [pick(UPPER), pick(LOWER), pick(DIGIT), pick(SYMBOL)];
  while (chars.length < length) chars.push(pick(all));
  // Fisher–Yates shuffle so the guaranteed classes aren't always in front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
