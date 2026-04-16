import { ObjectTone } from './object-bible';

const ALLOWED_TONES: ObjectTone[] = [
  'dramatic',
  'funny',
  'emotional',
  'sarcastic',
  'motivational',
];

export function normalizeTone(tone?: string): ObjectTone {
  if (!tone) return 'dramatic';
  const candidate = tone.trim().toLowerCase();
  return ALLOWED_TONES.includes(candidate as ObjectTone)
    ? (candidate as ObjectTone)
    : 'dramatic';
}
