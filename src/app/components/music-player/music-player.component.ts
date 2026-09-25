import {
  Component,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MusicCatalogService } from '../../services/music-catalog.service';

@Component({
  selector: 'app-music-player',
  imports: [NgOptimizedImage],
  templateUrl: './music-player.component.html',
  styleUrl: './music-player.component.css',
})
export class MusicPlayerComponent implements OnDestroy {
  private static readonly SCRUB_ACTIVATION_DELAY_MS = 300;
  private static readonly SCRUB_TICK_MS = 150;
  private static readonly SCRUB_ACCEL_INTERVAL_MS = 1000;
  private static readonly SCRUB_MAX_STEP_SECONDS = 8;
  private static readonly SEEK_STEP_SECONDS = 5;

  readonly songs = inject(MusicCatalogService).songs;
  readonly currentIndex = signal(0);
  readonly currentSong = computed(
    () => this.songs()[this.currentIndex()] ?? null,
  );
  readonly isPlaying = signal(false);
  readonly currentTime = signal(0);
  readonly currentAudioDuration = signal(0);

  readonly scrubDirection = signal<1 | -1 | null>(null);
  readonly scrubStep = signal(1);
  readonly isDraggingProgress = signal(false);

  readonly formattedCurrentTime = computed(() =>
    this.formatTime(this.currentTime()),
  );
  readonly formattedDuration = computed(() =>
    this.formatTime(this.currentAudioDuration()),
  );
  readonly canStop = computed(() => this.isPlaying() || this.currentTime() > 0);

  private audio: HTMLAudioElement | null = null;
  private progressInterval: number | null = null;

  private scrubHoldTimeoutId: number | null = null;
  private scrubIntervalId: number | null = null;
  private scrubStartedAt = 0;
  private wasScrubbing = false;

  private readonly onLoadedMetadata = () => {
    if (this.audio) {
      this.currentAudioDuration.set(Math.ceil(this.audio.duration));
    }
  };

  private readonly onEnded = () => {
    this.playNextSong();
  };

  private readonly onError = (e: Event) => {
    console.error('Audio loading error:', e);
    this.isPlaying.set(false);
  };

  constructor() {
    // Set up the first song's audio as soon as the song list has loaded, so its
    // duration shows before anything is played.
    effect(() => {
      if (this.currentSong() && !this.audio) {
        untracked(() => this.initializeAudio());
      }
    });
  }

  ngOnDestroy(): void {
    this.cancelScrub();
    this.cleanup();
  }

  private initializeAudio(): void {
    const song = this.currentSong();
    if (typeof window !== 'undefined' && song) {
      this.cleanup(); // Clean up previous audio instance
      this.audio = new Audio(song.src);

      this.audio.addEventListener('loadedmetadata', this.onLoadedMetadata);
      this.audio.addEventListener('ended', this.onEnded);
      this.audio.addEventListener('error', this.onError);
    }
  }

  /** Toggles between playing and pausing the current song, preserving position. */
  playPauseSong(): void {
    if (!this.currentSong() || !this.audio) return;

    if (this.audio.paused) {
      this.startPlayback();
    } else {
      this.pausePlaybackOnly();
    }
  }

  /** Pauses playback and resets the track back to the beginning. */
  stopSong(): void {
    if (!this.audio) return;

    this.pausePlaybackOnly();
    this.currentTime.set(0);
    this.audio.currentTime = 0;
  }

  private startPlayback(): void {
    if (!this.audio) return;

    this.audio
      .play()
      .then(() => {
        this.isPlaying.set(true);
        this.startProgressTracking();
      })
      .catch((error) => {
        console.error('Audio playback error:', error);
        this.isPlaying.set(false);
      });
  }

  private pausePlaybackOnly(): void {
    if (!this.audio) return;

    this.audio.pause();
    this.isPlaying.set(false);
    this.stopProgressTracking();
  }

  private startProgressTracking(): void {
    this.stopProgressTracking(); // Clear any existing interval

    this.progressInterval = window.setInterval(() => {
      if (this.audio && !this.audio.paused && !this.isDraggingProgress()) {
        this.currentTime.set(this.audio.currentTime);

        // Check if song has ended
        if (this.audio.currentTime >= this.audio.duration) {
          this.playNextSong();
        }
      }
    }, 100);
  }

  private stopProgressTracking(): void {
    if (this.progressInterval !== null) {
      window.clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  playNextSong(): void {
    const nextIndex = (this.currentIndex() + 1) % this.songs().length;
    this.changeSong(nextIndex);
  }

  playPreviousSong(): void {
    const prevIndex =
      (this.currentIndex() - 1 + this.songs().length) % this.songs().length;
    this.changeSong(prevIndex);
  }

  private changeSong(newIndex: number): void {
    this.stopSong();
    this.currentIndex.set(newIndex);
    this.initializeAudio();
    this.startPlayback();
  }

  /**
   * Starts a "press and hold" scrub on the previous/next buttons: after a short
   * activation delay, repeatedly seeks within the current song, accelerating
   * the further it's held (like fast-forward/rewind on a tape/CD player).
   */
  onScrubPointerDown(direction: 1 | -1, event: PointerEvent): void {
    event.preventDefault();
    this.wasScrubbing = false;

    this.scrubHoldTimeoutId = window.setTimeout(() => {
      this.beginScrubbing(direction);
    }, MusicPlayerComponent.SCRUB_ACTIVATION_DELAY_MS);
  }

  onScrubPointerUp(): void {
    this.cancelScrub();
  }

  /** Handles the click that follows a pointer press: skip a track on a quick tap. */
  onScrubClick(direction: 1 | -1): void {
    if (this.wasScrubbing) {
      this.wasScrubbing = false;
      return;
    }

    if (direction === 1) {
      this.playNextSong();
    } else {
      this.playPreviousSong();
    }
  }

  private beginScrubbing(direction: 1 | -1): void {
    if (!this.audio) return;

    this.wasScrubbing = true;
    this.scrubStartedAt = Date.now();
    this.scrubStep.set(1);
    this.scrubDirection.set(direction);

    this.scrubIntervalId = window.setInterval(() => {
      if (!this.audio) return;

      const heldMs = Date.now() - this.scrubStartedAt;
      const accelerationSteps = Math.floor(
        heldMs / MusicPlayerComponent.SCRUB_ACCEL_INTERVAL_MS,
      );
      const step = Math.min(
        1 + accelerationSteps,
        MusicPlayerComponent.SCRUB_MAX_STEP_SECONDS,
      );
      this.scrubStep.set(step);

      const duration = this.audio.duration || this.currentAudioDuration();
      const newTime = Math.min(
        Math.max(this.audio.currentTime + direction * step, 0),
        duration,
      );
      this.audio.currentTime = newTime;
      this.currentTime.set(newTime);
    }, MusicPlayerComponent.SCRUB_TICK_MS);
  }

  private cancelScrub(): void {
    if (this.scrubHoldTimeoutId !== null) {
      window.clearTimeout(this.scrubHoldTimeoutId);
      this.scrubHoldTimeoutId = null;
    }
    if (this.scrubIntervalId !== null) {
      window.clearInterval(this.scrubIntervalId);
      this.scrubIntervalId = null;
    }
    this.scrubDirection.set(null);
  }

  /** Seeks (and keeps seeking while dragging) to the pointer's position on the progress bar. */
  onProgressPointerDown(event: PointerEvent): void {
    if (!this.audio || this.currentAudioDuration() <= 0) return;

    this.isDraggingProgress.set(true);
    this.seekFromPointerEvent(event);

    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture?.(event.pointerId);
  }

  onProgressPointerMove(event: PointerEvent): void {
    if (!this.isDraggingProgress()) return;
    this.seekFromPointerEvent(event);
  }

  onProgressPointerUp(event: PointerEvent): void {
    if (!this.isDraggingProgress()) return;

    this.isDraggingProgress.set(false);

    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
  }

  /** Lets the progress bar be seeked with the keyboard when focused. */
  onProgressKeydown(event: KeyboardEvent): void {
    if (!this.audio) return;

    const duration = this.currentAudioDuration();
    let newTime: number;

    switch (event.key) {
      case 'ArrowRight':
        newTime = Math.min(
          this.audio.currentTime + MusicPlayerComponent.SEEK_STEP_SECONDS,
          duration,
        );
        break;
      case 'ArrowLeft':
        newTime = Math.max(
          this.audio.currentTime - MusicPlayerComponent.SEEK_STEP_SECONDS,
          0,
        );
        break;
      case 'Home':
        newTime = 0;
        break;
      case 'End':
        newTime = duration;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.currentTime.set(newTime);
    this.audio.currentTime = newTime;
  }

  private seekFromPointerEvent(event: PointerEvent): void {
    if (!this.audio) return;

    const track = event.currentTarget as HTMLElement;
    const rect = track.getBoundingClientRect();
    const fraction =
      rect.width > 0
        ? Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
        : 0;

    const newTime = fraction * this.currentAudioDuration();
    this.currentTime.set(newTime);
    this.audio.currentTime = newTime;
  }

  private cleanup(): void {
    if (this.audio) {
      this.audio.removeEventListener('loadedmetadata', this.onLoadedMetadata);
      this.audio.removeEventListener('ended', this.onEnded);
      this.audio.removeEventListener('error', this.onError);
      this.audio.pause();
      this.audio.src = '';
      this.audio.load();
      this.stopProgressTracking();
    }
  }

  formatTime(seconds: number): string {
    const minutes: number = Math.floor(seconds / 60);
    const remainingSeconds: number = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
