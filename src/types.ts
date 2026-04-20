export type Tab = 'fortune' | 'chart' | 'calendar' | 'divination' | 'profile';

export interface FiveElement {
  name: string;
  en: string;
  value: number;
  color: string;
}

export interface FortuneScore {
  label: string;
  icon: string;
  score: number;
  analysis?: string;
}
