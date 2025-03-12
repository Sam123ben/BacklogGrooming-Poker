export const FIBONACCI_NUMBERS = [1, 2, 3, 5, 8, 13];

export const CARD_DESCRIPTIONS = {
  1: "Clear requirements, straightforward implementation. No unknowns.",
  2: "Simple task with minor complexity. Well understood.",
  3: "Understood requirements but may have some unknowns or technical challenges.",
  5: "Moderate complexity. Some unknowns that need discussion.",
  8: "Complex task with significant unknowns. Requires thorough planning.",
  13: "Very complex. Needs breaking down. High uncertainty or technical challenges."
} as const;

export const CARD_COLORS = {
  1: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/30',
  2: 'from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-900/30',
  3: 'from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-900/30',
  5: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30',
  8: 'from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-900/30',
  13: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30'
} as const;

export const CARD_LABELS = {
  1: 'Very Simple',
  2: 'Simple',
  3: 'Moderate',
  5: 'Complex',
  8: 'Very Complex',
  13: 'Extremely Complex'
} as const;