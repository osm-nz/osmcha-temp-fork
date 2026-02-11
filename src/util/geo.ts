import type { BBox } from 'osm-api';

export const parseBbox = (str: string) =>
  str.split(',').map(Number) as never as BBox;
