import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { LoadMusicService } from './load-music.service';

describe('LoadMusicService', () => {
  let service: LoadMusicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadMusicService);
  });

  it('loads a non-empty list of songs shaped like Song', () => {
    const songs = service.loadMusic();

    expect(Array.isArray(songs)).toBe(true);
    expect(songs.length).toBeGreaterThan(0);

    for (const song of songs) {
      expect(typeof song.title).toBe('string');
      expect(typeof song.artwork).toBe('string');
      expect(typeof song.src).toBe('string');
    }
  });
});
