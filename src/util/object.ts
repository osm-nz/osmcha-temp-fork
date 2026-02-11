export const uniqBy = <T>(property: keyof T, array: T[]): T[] => [
  ...new Map(array.map((item) => [item[property], item])).values(),
];

export function* createChunks<T>(
  array: T[],
  limit: number,
): Generator<T[], void, void> {
  for (let index = 0; index < array.length; index += limit) {
    yield array.slice(index, index + limit);
  }
}
