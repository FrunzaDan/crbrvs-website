import { ViewportScroller } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BackToTopComponent } from './back-to-top.component';

describe('BackToTopComponent', () => {
  let fixture: ComponentFixture<BackToTopComponent>;
  let component: BackToTopComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BackToTopComponent],
      providers: [
        { provide: ViewportScroller, useValue: { scrollToPosition: vi.fn() } },
      ],
    });

    fixture = TestBed.createComponent(BackToTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not show the button initially', () => {
    expect(component.shouldShowBackToTopButton()).toBe(false);
  });

  it('ignores small scroll deltas below the sensitivity threshold', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(300);

    component.onWindowScroll();

    expect(component.shouldShowBackToTopButton()).toBe(false);
  });

  it('shows the button once scrolled past the threshold by more than 400px', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(1500);

    component.onWindowScroll();

    expect(component.shouldShowBackToTopButton()).toBe(true);
  });

  it('hides the button again once scrolled back above the threshold', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(1500);
    component.onWindowScroll();
    expect(component.shouldShowBackToTopButton()).toBe(true);

    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(0);
    component.onWindowScroll();

    expect(component.shouldShowBackToTopButton()).toBe(false);
  });

  it('does not move the reference position for a delta at exactly the sensitivity threshold', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(400);
    component.onWindowScroll();
    expect(component.shouldShowBackToTopButton()).toBe(false);

    // A second small scroll on top of the ignored one: if the reference position
    // had moved to 400, this delta would only be 300 and stay ignored too.
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(700);
    component.onWindowScroll();

    expect(component.shouldShowBackToTopButton()).toBe(false);
  });

  it('stays hidden for a scroll position at exactly the show-button threshold', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(1200);

    component.onWindowScroll();

    expect(component.shouldShowBackToTopButton()).toBe(false);
  });

  it('shows the button just past the show-button threshold', () => {
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(1201);

    component.onWindowScroll();

    expect(component.shouldShowBackToTopButton()).toBe(true);
  });
});
