import { describe, expect, it, vi } from 'vitest';
import { parseMerchItems, parseSongs } from './parsers';

describe('parsers', () => {
  const tee = {
    id: 1,
    title: 'Tee',
    price: 100,
    src: '/tee.webp',
    width: 300,
    height: 300,
    description: 'A shirt',
  };
  const song = { title: 'Later', artwork: '/a.webp', src: '/a.mp3' };

  it('keeps well-formed items and drops unknown fields', () => {
    expect(parseMerchItems([{ ...tee, extra: true }])).toEqual([tee]);
    expect(parseSongs([{ ...song, extra: true }])).toEqual([song]);
  });

  it('skips malformed entries instead of failing the whole list', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(
      parseMerchItems([tee, { ...tee, price: -1 }, { ...tee, width: 0 }, null]),
    ).toEqual([tee]);
    expect(parseSongs([song, { ...song, src: '' }, 'song'])).toEqual([song]);
  });

  it('returns an empty list for anything that is not an array', () => {
    expect(parseMerchItems(tee)).toEqual([]);
    expect(parseSongs(undefined)).toEqual([]);
  });
});
