import { Component, inject, signal } from '@angular/core';
import { ScrollerService } from '../../services/scroller.service';

/** How far down the page the button appears. */
const SHOW_BUTTON_THRESHOLD = 1200;
/** How far the page has to scroll before the button's visibility is checked again. */
const SCROLL_CHECK_DISTANCE = 400;

@Component({
  selector: 'app-back-to-top',
  templateUrl: './back-to-top.component.html',
  styleUrl: './back-to-top.component.css',
  host: {
    '(window:scroll)': 'onWindowScroll()',
  },
})
export class BackToTopComponent {
  readonly scrollerService = inject(ScrollerService);

  private prevScrollPos = 0;

  readonly shouldShowBackToTopButton = signal(false);

  onWindowScroll(): void {
    const currentScrollPos = window.scrollY;
    if (
      Math.abs(currentScrollPos - this.prevScrollPos) > SCROLL_CHECK_DISTANCE
    ) {
      this.shouldShowBackToTopButton.set(
        currentScrollPos > SHOW_BUTTON_THRESHOLD,
      );
      this.prevScrollPos = currentScrollPos;
    }
  }
}
