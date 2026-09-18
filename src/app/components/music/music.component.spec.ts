import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MusicComponent } from './music.component';

describe('MusicComponent', () => {
  let fixture: ComponentFixture<MusicComponent>;
  let component: MusicComponent;
  let playSpy: ReturnType<typeof vi.fn>;
  let matchMediaMock: ReturnType<typeof vi.fn>;

  function configure(platformId: 'browser' | 'server'): void {
    TestBed.configureTestingModule({
      imports: [MusicComponent],
      providers: [{ provide: PLATFORM_ID, useValue: platformId }],
    });

    fixture = TestBed.createComponent(MusicComponent);
    component = fixture.componentInstance;
  }

  function stubReducedMotion(matches: boolean): void {
    matchMediaMock = vi.fn().mockReturnValue({ matches });
    vi.stubGlobal('matchMedia', matchMediaMock);
  }

  beforeEach(() => {
    // jsdom's HTMLMediaElement stubs throw "not implemented" for play()/load(),
    // and MusicComponent renders both a <video> and an app-music-player that
    // touch these on init.
    playSpy = vi
      .spyOn(window.HTMLMediaElement.prototype, 'play')
      .mockResolvedValue();
    vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(
      () => {},
    );
    vi.spyOn(window.HTMLMediaElement.prototype, 'load').mockImplementation(
      () => {},
    );
  });

  afterEach(() => {
    // Destroy explicitly (and before restoring mocks) so the child
    // app-music-player's ngOnDestroy cleanup still hits the mocked
    // pause()/load(), instead of jsdom's real "not implemented" stubs.
    fixture?.destroy();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('in the browser', () => {
    beforeEach(() => configure('browser'));

    it('plays the teaser video when the user has no reduced-motion preference', () => {
      stubReducedMotion(false);

      fixture.detectChanges(); // triggers ngAfterViewInit

      expect(matchMediaMock).toHaveBeenCalledWith(
        '(prefers-reduced-motion: reduce)',
      );
      expect(playSpy).toHaveBeenCalled();
    });

    it('does not play the teaser video when the user prefers reduced motion', () => {
      stubReducedMotion(true);

      fixture.detectChanges();

      expect(playSpy).not.toHaveBeenCalled();
    });

    it('swallows a rejected play() promise instead of throwing', () => {
      stubReducedMotion(false);
      playSpy.mockRejectedValue(new Error('autoplay blocked'));

      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('outside the browser (SSR)', () => {
    beforeEach(() => configure('server'));

    it('does not check the reduced-motion preference or touch the video element', () => {
      stubReducedMotion(false);

      fixture.detectChanges();

      expect(matchMediaMock).not.toHaveBeenCalled();
      expect(playSpy).not.toHaveBeenCalled();
    });
  });
});
