import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { MusicPlayerComponent } from './music-player.component';

describe('MusicPlayerComponent', () => {
  let fixture: ComponentFixture<MusicPlayerComponent>;
  let component: MusicPlayerComponent;

  function audioEl(): HTMLAudioElement {
    return (component as unknown as { audio: HTMLAudioElement }).audio;
  }

  function fakePointerEvent(
    overrides: Partial<PointerEvent> = {},
  ): PointerEvent {
    return {
      preventDefault: vi.fn(),
      pointerId: 1,
      clientX: 0,
      currentTarget: {
        getBoundingClientRect: () => ({ left: 0, width: 200 }),
        setPointerCapture: vi.fn(),
        hasPointerCapture: vi.fn().mockReturnValue(false),
        releasePointerCapture: vi.fn(),
      },
      ...overrides,
    } as unknown as PointerEvent;
  }

  beforeEach(() => {
    // jsdom's play()/pause() are stubs that never flip `paused`, so mock them
    // to actually track play state the way the component's branching relies on.
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(
      function (this: HTMLAudioElement) {
        Object.defineProperty(this, 'paused', {
          value: false,
          configurable: true,
        });
        return Promise.resolve();
      },
    );
    vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(
      function (this: HTMLAudioElement) {
        Object.defineProperty(this, 'paused', {
          value: true,
          configurable: true,
        });
      },
    );
    vi.spyOn(window.HTMLMediaElement.prototype, 'load').mockImplementation(
      () => {},
    );

    TestBed.configureTestingModule({
      imports: [MusicPlayerComponent],
    });

    fixture = TestBed.createComponent(MusicPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Give the progress bar / scrub math a duration to work against.
    component.currentAudioDuration.set(180);
  });

  afterEach(() => {
    try {
      fixture.destroy();
    } catch {
      // already destroyed by the test itself
    }
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('loads the first song on init without autoplaying', () => {
    expect(component.songs().length).toBeGreaterThan(0);
    expect(component.currentSong()).toEqual(component.songs()[0]);
    expect(component.currentIndex()).toBe(0);
    expect(component.isPlaying()).toBe(false);
  });

  describe('playPauseSong / stopSong', () => {
    it('starts playback on the first press', async () => {
      component.playPauseSong();
      await Promise.resolve();
      await Promise.resolve();

      expect(audioEl().play).toHaveBeenCalled();
      expect(component.isPlaying()).toBe(true);
    });

    it('pauses without resetting the current position', async () => {
      component.currentTime.set(42);
      audioEl().currentTime = 42;

      component.playPauseSong(); // play
      await Promise.resolve();
      await Promise.resolve();
      expect(component.isPlaying()).toBe(true);

      component.playPauseSong(); // pause
      expect(component.isPlaying()).toBe(false);
      expect(component.currentTime()).toBe(42);
      expect(audioEl().currentTime).toBe(42);
    });

    it('stopSong pauses and resets the position back to zero', () => {
      component.currentTime.set(77);
      audioEl().currentTime = 77;

      component.stopSong();

      expect(component.isPlaying()).toBe(false);
      expect(component.currentTime()).toBe(0);
      expect(audioEl().currentTime).toBe(0);
    });
  });

  describe('track navigation', () => {
    it('playNextSong advances to the next track and resets position', () => {
      const total = component.songs().length;
      const startIndex = component.currentIndex();
      component.currentTime.set(55);

      component.playNextSong();

      expect(component.currentIndex()).toBe((startIndex + 1) % total);
      expect(component.currentSong()).toEqual(
        component.songs()[(startIndex + 1) % total],
      );
      expect(component.currentTime()).toBe(0);
    });

    it('playPreviousSong wraps around to the last track from the first', () => {
      const total = component.songs().length;

      component.playPreviousSong();

      expect(component.currentIndex()).toBe(total - 1);
    });
  });

  describe('press-and-hold scrubbing on the transport buttons', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('treats a quick tap as a normal track skip', () => {
      const total = component.songs().length;
      const startIndex = component.currentIndex();

      component.onScrubPointerDown(1, fakePointerEvent());
      component.onScrubPointerUp(); // released before the activation delay elapses
      component.onScrubClick(1);

      expect(component.currentIndex()).toBe((startIndex + 1) % total);
    });

    it('seeks forward within the track while held, without skipping songs', () => {
      const startIndex = component.currentIndex();
      component.currentTime.set(50);
      audioEl().currentTime = 50;

      component.onScrubPointerDown(1, fakePointerEvent());
      vi.advanceTimersByTime(300); // activation delay
      expect(component.scrubDirection()).toBe(1);

      vi.advanceTimersByTime(150); // one scrub tick
      expect(component.currentTime()).toBeGreaterThan(50);
      expect(component.currentIndex()).toBe(startIndex);

      component.onScrubPointerUp();
      expect(component.scrubDirection()).toBeNull();

      // The click that follows the pointer release must not also skip a track.
      component.onScrubClick(1);
      expect(component.currentIndex()).toBe(startIndex);
    });

    it('accelerates the further the button is held', () => {
      component.currentTime.set(50);
      audioEl().currentTime = 50;

      component.onScrubPointerDown(1, fakePointerEvent());
      vi.advanceTimersByTime(300);
      vi.advanceTimersByTime(150);
      const stepEarly = component.scrubStep();

      vi.advanceTimersByTime(2000);
      const stepLater = component.scrubStep();

      expect(stepLater).toBeGreaterThan(stepEarly);

      component.onScrubPointerUp();
    });

    it('seeks backward when held on the previous button', () => {
      component.currentTime.set(50);
      audioEl().currentTime = 50;

      component.onScrubPointerDown(-1, fakePointerEvent());
      vi.advanceTimersByTime(300);
      vi.advanceTimersByTime(150);

      expect(component.currentTime()).toBeLessThan(50);

      component.onScrubPointerUp();
    });
  });

  describe('progress bar seeking', () => {
    it('seeks to the pointer position on pointer down and while dragging', () => {
      component.onProgressPointerDown(fakePointerEvent({ clientX: 90 }));

      expect(component.isDraggingProgress()).toBe(true);
      expect(component.currentTime()).toBeCloseTo(0.45 * 180);

      component.onProgressPointerMove(fakePointerEvent({ clientX: 180 }));
      expect(component.currentTime()).toBeCloseTo(0.9 * 180);

      component.onProgressPointerUp(fakePointerEvent({ clientX: 180 }));
      expect(component.isDraggingProgress()).toBe(false);
    });

    it('ignores pointer moves once dragging has ended', () => {
      component.onProgressPointerDown(fakePointerEvent({ clientX: 90 }));
      component.onProgressPointerUp(fakePointerEvent({ clientX: 90 }));

      const timeAfterDrag = component.currentTime();
      component.onProgressPointerMove(fakePointerEvent({ clientX: 180 }));

      expect(component.currentTime()).toBe(timeAfterDrag);
    });

    it('seeks with the keyboard when focused', () => {
      component.currentTime.set(10);
      audioEl().currentTime = 10;

      component.onProgressKeydown({
        key: 'ArrowRight',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);
      expect(component.currentTime()).toBe(15);

      component.onProgressKeydown({
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);
      expect(component.currentTime()).toBe(10);

      component.onProgressKeydown({
        key: 'End',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);
      expect(component.currentTime()).toBe(180);

      component.onProgressKeydown({
        key: 'Home',
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);
      expect(component.currentTime()).toBe(0);
    });
  });

  describe('canStop', () => {
    it('is only true once playback has started or the track has moved past 0', () => {
      expect(component.canStop()).toBe(false);

      component.currentTime.set(5);
      expect(component.canStop()).toBe(true);

      component.currentTime.set(0);
      expect(component.canStop()).toBe(false);

      component.isPlaying.set(true);
      expect(component.canStop()).toBe(true);
    });
  });

  describe('formatTime', () => {
    it('formats seconds as m:ss with zero-padded seconds', () => {
      expect(component.formatTime(0)).toBe('0:00');
      expect(component.formatTime(5)).toBe('0:05');
      expect(component.formatTime(65)).toBe('1:05');
      expect(component.formatTime(599)).toBe('9:59');
      expect(component.formatTime(600)).toBe('10:00');
    });
  });

  describe('audio element event handlers', () => {
    it('sets the duration once metadata loads', () => {
      Object.defineProperty(audioEl(), 'duration', {
        value: 245.4,
        configurable: true,
      });

      audioEl().dispatchEvent(new Event('loadedmetadata'));

      expect(component.currentAudioDuration()).toBe(Math.ceil(245.4));
    });

    it('advances to the next song when the audio element fires "ended"', () => {
      const total = component.songs().length;
      const startIndex = component.currentIndex();

      audioEl().dispatchEvent(new Event('ended'));

      expect(component.currentIndex()).toBe((startIndex + 1) % total);
    });

    it('stops playback and logs when the audio element errors', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      component.isPlaying.set(true);

      audioEl().dispatchEvent(new Event('error'));

      expect(component.isPlaying()).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('progress tracking while playing', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('advances currentTime from the audio element on an interval', async () => {
      component.playPauseSong();
      await Promise.resolve();
      await Promise.resolve();

      audioEl().currentTime = 10;
      vi.advanceTimersByTime(100);
      expect(component.currentTime()).toBeCloseTo(10);

      audioEl().currentTime = 20;
      vi.advanceTimersByTime(100);
      expect(component.currentTime()).toBeCloseTo(20);
    });

    it('does not let the tracking interval fight a manual progress-bar drag', async () => {
      component.playPauseSong();
      await Promise.resolve();
      await Promise.resolve();

      component.isDraggingProgress.set(true);
      audioEl().currentTime = 99;
      component.currentTime.set(42);

      vi.advanceTimersByTime(100);

      expect(component.currentTime()).toBe(42);
    });

    it('advances to the next song once the tracked time reaches the duration', async () => {
      const total = component.songs().length;
      const startIndex = component.currentIndex();

      component.playPauseSong();
      await Promise.resolve();
      await Promise.resolve();

      Object.defineProperty(audioEl(), 'duration', {
        value: 30,
        configurable: true,
      });
      audioEl().currentTime = 30;

      vi.advanceTimersByTime(100);

      expect(component.currentIndex()).toBe((startIndex + 1) % total);
    });
  });

  describe('ngOnDestroy', () => {
    it('pauses the audio, clears its source, and detaches the listeners', () => {
      const audio = audioEl();
      const removeEventListenerSpy = vi.spyOn(audio, 'removeEventListener');

      fixture.destroy();

      expect(audio.pause).toHaveBeenCalled();
      expect(audio.getAttribute('src')).toBe('');
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'loadedmetadata',
        expect.any(Function),
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'ended',
        expect.any(Function),
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'error',
        expect.any(Function),
      );
    });
  });

  describe('DOM wiring', () => {
    function button(label: string): HTMLButtonElement {
      const el = fixture.nativeElement.querySelector(
        `[aria-label="${label}"]`,
      );
      if (!el) {
        throw new Error(`No button found with aria-label "${label}"`);
      }
      return el as HTMLButtonElement;
    }

    it('toggles the play/pause button label and icon when clicked', async () => {
      const playBtn = button('Play');
      const icon = playBtn.querySelector('.player-action-icon')!;
      expect(icon.classList.contains('action-btn-play')).toBe(true);

      playBtn.click();
      await Promise.resolve();
      await Promise.resolve();
      fixture.detectChanges();

      const pauseBtn = button('Pause');
      expect(pauseBtn).toBe(playBtn);
      expect(icon.classList.contains('action-btn-pause')).toBe(true);
      expect(icon.classList.contains('action-btn-play')).toBe(false);
    });

    it('keeps the Stop button disabled until playback starts, and re-disables it on stop', async () => {
      const stopBtn = button('Stop');
      expect(stopBtn.disabled).toBe(true);

      button('Play').click();
      await Promise.resolve();
      await Promise.resolve();
      fixture.detectChanges();

      expect(stopBtn.disabled).toBe(false);

      stopBtn.click();
      fixture.detectChanges();

      expect(stopBtn.disabled).toBe(true);
    });

    it('skips tracks when the previous/next buttons are clicked', () => {
      const total = component.songs().length;

      button('Next song (press and hold to fast-forward)').click();
      expect(component.currentIndex()).toBe(1 % total);

      button('Previous song (press and hold to rewind)').click();
      expect(component.currentIndex()).toBe(0);
    });
  });
});
