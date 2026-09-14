import { ViewportScroller } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let component: NavbarComponent;
  let viewportScroller: { scrollToAnchor: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    viewportScroller = { scrollToAnchor: vi.fn() };
    router = { navigate: vi.fn() };
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: ViewportScroller, useValue: viewportScroller },
        { provide: Router, useValue: router },
      ],
    });

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts with the menu closed', () => {
    expect(component.isMenuOpen()).toBe(false);
  });

  it('opens and closes the menu via onToggleMenu', () => {
    component.onToggleMenu(true);
    expect(component.isMenuOpen()).toBe(true);

    component.onToggleMenu(false);
    expect(component.isMenuOpen()).toBe(false);
  });

  it('closeMenu sets the menu state to closed', () => {
    component.onToggleMenu(true);

    component.closeMenu();

    expect(component.isMenuOpen()).toBe(false);
  });

  describe('scrollToSection', () => {
    it('warns and does nothing for an empty element id', () => {
      component.scrollToSection('');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'scrollToSection: Invalid element ID provided.',
      );
      expect(viewportScroller.scrollToAnchor).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('scrolls to the anchor, updates the route fragment, and closes the menu', () => {
      component.onToggleMenu(true);

      component.scrollToSection('music');

      expect(viewportScroller.scrollToAnchor).toHaveBeenCalledWith('music');
      expect(router.navigate).toHaveBeenCalledWith([], {
        fragment: 'music',
      });
      expect(component.isMenuOpen()).toBe(false);
    });
  });
});
