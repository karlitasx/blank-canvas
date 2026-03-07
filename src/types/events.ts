export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  event_date: string;
  event_time?: string | null;
  end_time?: string | null;
  category: EventCategory;
  color: EventColor;
  is_recurring: boolean;
  recurring_pattern?: string | null;
  reminder_minutes?: number | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type EventCategory = 'personal' | 'work' | 'health' | 'social' | 'finance' | 'other';

export type EventColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink';

export interface CreateEventInput {
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  end_time?: string;
  category?: EventCategory;
  color?: EventColor;
  is_recurring?: boolean;
  recurring_pattern?: string;
  reminder_minutes?: number;
}

export const EVENT_CATEGORIES: { value: EventCategory; label: string; emoji: string }[] = [
  { value: 'personal', label: 'Pessoal', emoji: '🏠' },
  { value: 'work', label: 'Trabalho', emoji: '💼' },
  { value: 'health', label: 'Saúde', emoji: '❤️' },
  { value: 'social', label: 'Social', emoji: '👥' },
  { value: 'finance', label: 'Finanças', emoji: '💰' },
  { value: 'other', label: 'Outro', emoji: '📌' },
];

export const EVENT_COLORS: { value: EventColor; label: string; class: string }[] = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-500' },
  { value: 'green', label: 'Verde', class: 'bg-green-500' },
  { value: 'purple', label: 'Roxo', class: 'bg-purple-500' },
  { value: 'orange', label: 'Laranja', class: 'bg-orange-500' },
  { value: 'red', label: 'Vermelho', class: 'bg-red-500' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-500' },
];
