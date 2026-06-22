export const FREE_READING_LIMIT = 2;

export function canUseFreeReading(freeUsed: number) {
  return freeUsed < FREE_READING_LIMIT;
}
