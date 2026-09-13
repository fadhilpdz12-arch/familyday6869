export type Keputusan =
  | { ok: true; mesej: string }
  | { ok: false; mesej: string; medan?: Record<string, string[]> };

export const KEADAAN_AWAL: Keputusan | null = null;
