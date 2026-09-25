import { MerchItem } from '../interfaces/merch-item';
import { Song } from '../interfaces/song';

// Data from the JSON files in `public/assets` is only trusted after it has
// been checked here; anything malformed is dropped instead of cast.

type UnknownRecord = Readonly<Record<string, unknown>>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) > 0;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function parseMerchItem(value: unknown): MerchItem | undefined {
  if (!isRecord(value)) return undefined;
  const { id, title, price, src, width, height, description } = value;
  if (
    !Number.isInteger(id) ||
    !isNonBlankString(title) ||
    !isNonNegativeNumber(price) ||
    !isNonBlankString(src) ||
    !isPositiveInteger(width) ||
    !isPositiveInteger(height) ||
    typeof description !== 'string'
  ) {
    return undefined;
  }
  // Rebuilt field by field so that unknown extra fields are not carried along.
  return {
    id: id as number,
    title,
    price,
    src,
    width,
    height,
    description,
  };
}

export function parseMerchItems(value: unknown): MerchItem[] {
  return parseList(value, parseMerchItem);
}

export function parseSong(value: unknown): Song | undefined {
  if (!isRecord(value)) return undefined;
  const { title, artwork, src } = value;
  if (
    !isNonBlankString(title) ||
    !isNonBlankString(artwork) ||
    !isNonBlankString(src)
  ) {
    return undefined;
  }
  return { title, artwork, src };
}

export function parseSongs(value: unknown): Song[] {
  return parseList(value, parseSong);
}

function parseList<T>(
  value: unknown,
  parseItem: (item: unknown) => T | undefined,
): T[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = parseItem(item);
    if (parsed === undefined) {
      console.warn('Skipping malformed item:', item);
      return [];
    }
    return [parsed];
  });
}
