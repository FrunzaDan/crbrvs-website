import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { MusicPlayerComponent } from '../music-player/music-player.component';

@Component({
  selector: 'app-music',
  imports: [MusicPlayerComponent, NgOptimizedImage],
  templateUrl: './music.component.html',
  styleUrl: './music.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicComponent implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('teaserVideo') teaserVideoRef?: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (!prefersReducedMotion) {
      this.teaserVideoRef?.nativeElement.play().catch(() => {});
    }
  }
}
