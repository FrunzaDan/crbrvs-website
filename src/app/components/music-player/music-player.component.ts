import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Song } from '../../interfaces/song';
import { LoadMusicService } from '../../services/load-music.service';

@Component({
  selector: 'app-music-player',
  standalone: true,
  templateUrl: './music-player.component.html',
  styleUrl: './music-player.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicPlayerComponent implements OnInit, OnDestroy {
  private readonly loadMusicService = inject(LoadMusicService);

  songs = signal<Song[]>([]);
  currentSong = signal<Song | null>(null);
  isPlaying = signal<boolean>(false);
  currentTime = signal<number>(0);
  currentAudioDuration = signal<number>(0);
  currentIndex = signal<number>(0);

  readonly formattedCurrentTime = computed(() =>
    this.formatTime(this.currentTime()),
  );
  readonly formattedDuration = computed(() =>
    this.formatTime(this.currentAudioDuration()),
  );

  private audio: HTMLAudioElement | null = null;
  private progressInterval: number | null = null;

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

  ngOnInit(): void {
    const loadedSongs = this.loadMusicService.loadMusic();
    this.songs.set(loadedSongs);

    if (loadedSongs.length > 0) {
      this.initializeFirstSong();
    }
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private initializeFirstSong(): void {
    this.currentSong.set(this.songs()[0]);
    this.currentIndex.set(0);
    this.initializeAudio();
  }

  private initializeAudio(): void {
    if (typeof window !== 'undefined' && this.currentSong()) {
      this.cleanup(); // Clean up previous audio instance
      this.audio = new Audio(this.currentSong()!.src);

      this.audio.addEventListener('loadedmetadata', this.onLoadedMetadata);
      this.audio.addEventListener('ended', this.onEnded);
      this.audio.addEventListener('error', this.onError);
    }
  }

  playStopSong(): void {
    if (!this.currentSong() || !this.audio) return;

    if (this.audio.paused) {
      this.startPlayback();
    } else {
      this.stopPlayback();
    }
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

  private stopPlayback(): void {
    if (!this.audio) return;

    this.audio.pause();
    this.isPlaying.set(false);
    this.stopProgressTracking();
    this.currentTime.set(0);
    this.audio.currentTime = 0;
  }

  private startProgressTracking(): void {
    this.stopProgressTracking(); // Clear any existing interval

    this.progressInterval = window.setInterval(() => {
      if (this.audio && !this.audio.paused) {
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
    this.stopPlayback();
    this.currentIndex.set(newIndex);
    this.currentSong.set(this.songs()[newIndex]);
    this.initializeAudio();
    this.startPlayback();
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
