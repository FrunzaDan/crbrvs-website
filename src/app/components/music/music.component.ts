import { NgOptimizedImage } from '@angular/common';
import {
  Component,
  ElementRef,
  afterNextRender,
  viewChild,
} from '@angular/core';
import { MusicPlayerComponent } from '../music-player/music-player.component';

@Component({
  selector: 'app-music',
  imports: [MusicPlayerComponent, NgOptimizedImage],
  templateUrl: './music.component.html',
  styleUrl: './music.component.css',
})
export class MusicComponent {
  private readonly teaserVideo =
    viewChild<ElementRef<HTMLVideoElement>>('teaserVideo');

  constructor() {
    // Render hooks only run in the browser, so this never touches `window` on the server.
    afterNextRender(() => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      if (!prefersReducedMotion) {
        this.teaserVideo()
          ?.nativeElement.play()
          .catch(() => {});
      }
    });
  }
}
