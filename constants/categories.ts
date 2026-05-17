import type { Database } from '../types/database';

// Single source of truth: the union is derived from the DB enum so the app
// can never drift from the schema.
export type DealCategory = Database['public']['Enums']['deal_category'];

export const DEAL_CATEGORIES: { value: DealCategory; label: string }[] = [
  { value: 'food', label: 'Food' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'other', label: 'Other' },
];

const LABELS: Record<DealCategory, string> = Object.fromEntries(
  DEAL_CATEGORIES.map((c) => [c.value, c.label]),
) as Record<DealCategory, string>;

export const categoryLabel = (value: DealCategory): string => LABELS[value];
