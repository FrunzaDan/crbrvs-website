import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { ScrollerService } from '../../services/scroller.service';

@Component({
  selector: 'app-back-to-top',
  imports: [],
  templateUrl: './back-to-top.component.html',
  styleUrl: './back-to-top.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackToTopComponent {
  readonly scrollerService = inject(ScrollerService);

  private prevScrollPos: number = 0;
  SHOW_BUTTON_THRESHOLD: number = 1200;

  shouldShowBackToTopButton = signal(false);

  @HostListener('window:scroll', ['$event'])
  onWindowScroll($event: any): void {
    const currentScrollPos: number = window.scrollY;
    const scrolledEnough: boolean =
      Math.abs(currentScrollPos - this.prevScrollPos) > 400;
    if (scrolledEnough) {
      this.shouldShowBackToTopButton.set(
        currentScrollPos > this.SHOW_BUTTON_THRESHOLD,
      );
      this.prevScrollPos = currentScrollPos;
    }
  }
}
