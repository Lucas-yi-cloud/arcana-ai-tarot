export const FREE_READING_LIMIT = 1;

export function canUseFreeReading(freeUsed: number) {
  return freeUsed < FREE_READING_LIMIT;
}
