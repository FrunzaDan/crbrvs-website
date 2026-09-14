import { ViewportScroller } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScrollerService } from './scroller.service';

describe('ScrollerService', () => {
  let service: ScrollerService;
  let viewportScroller: { scrollToPosition: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    viewportScroller = { scrollToPosition: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: ViewportScroller, useValue: viewportScroller },
      ],
    });

    service = TestBed.inject(ScrollerService);
  });

  it('scrolls the viewport to the top', () => {
    service.scrollToTop();

    expect(viewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 0]);
  });

  describe('scrollToLeft', () => {
    it('does nothing when the container is null', () => {
      expect(() => service.scrollToLeft(null)).not.toThrow();
    });

    it('scrolls left by the given offset', () => {
      const container = {
        scrollWidth: 1000,
        clientWidth: 400,
        scrollLeft: 500,
        scrollTo: vi.fn(),
      } as unknown as Element;

      service.scrollToLeft(container, 200);

      expect(container.scrollTo).toHaveBeenCalledWith({
        behavior: 'smooth',
        left: 300,
      });
    });

    it('clamps the scroll position at 0', () => {
      const container = {
        scrollWidth: 1000,
        clientWidth: 400,
        scrollLeft: 100,
        scrollTo: vi.fn(),
      } as unknown as Element;

      service.scrollToLeft(container, 400);

      expect(container.scrollTo).toHaveBeenCalledWith({
        behavior: 'smooth',
        left: 0,
      });
    });
  });

  describe('scrollToRight', () => {
    it('scrolls right by the given offset', () => {
      const container = {
        scrollWidth: 1000,
        clientWidth: 400,
        scrollLeft: 100,
        scrollTo: vi.fn(),
      } as unknown as Element;

      service.scrollToRight(container, 200);

      expect(container.scrollTo).toHaveBeenCalledWith({
        behavior: 'smooth',
        left: 300,
      });
    });

    it('clamps the scroll position at the maximum scrollable width', () => {
      const container = {
        scrollWidth: 1000,
        clientWidth: 400,
        scrollLeft: 500,
        scrollTo: vi.fn(),
      } as unknown as Element;

      service.scrollToRight(container, 400);

      expect(container.scrollTo).toHaveBeenCalledWith({
        behavior: 'smooth',
        left: 600,
      });
    });

    it('uses a default offset of 400 when none is provided', () => {
      const container = {
        scrollWidth: 2000,
        clientWidth: 400,
        scrollLeft: 0,
        scrollTo: vi.fn(),
      } as unknown as Element;

      service.scrollToRight(container);

      expect(container.scrollTo).toHaveBeenCalledWith({
        behavior: 'smooth',
        left: 400,
      });
    });
  });
});
