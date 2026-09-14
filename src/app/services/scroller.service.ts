import { ViewportScroller } from '@angular/common';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScrollerService {
  private readonly viewportScroller = inject(ViewportScroller);

  scrollToTop(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  private scrollHorizontally(
    container: Element | null,
    offset: number,
    direction: 'left' | 'right',
  ): void {
    if (!container) {
      return;
    }

    const { scrollWidth, clientWidth, scrollLeft } = container;
    const maxScrollLeft = scrollWidth - clientWidth;
    let newScrollLeft =
      direction === 'left'
        ? Math.max(scrollLeft - offset, 0)
        : scrollLeft + offset;

    newScrollLeft =
      direction === 'left'
        ? Math.max(newScrollLeft, 0)
        : Math.min(newScrollLeft, maxScrollLeft);

    container.scrollTo({ behavior: 'smooth', left: newScrollLeft });
  }

  scrollToLeft(container: Element | null, offset: number = 400): void {
    this.scrollHorizontally(container, offset, 'left');
  }

  // Scroll to the right with optional offset (default: 400)
  scrollToRight(container: Element | null, offset: number = 400): void {
    this.scrollHorizontally(container, offset, 'right');
  }
}
