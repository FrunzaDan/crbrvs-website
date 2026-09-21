import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { HamburgerButtonComponent } from './hamburger-button.component';

describe('HamburgerButtonComponent', () => {
  let fixture: ComponentFixture<HamburgerButtonComponent>;
  let component: HamburgerButtonComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HamburgerButtonComponent],
    });

    fixture = TestBed.createComponent(HamburgerButtonComponent);
    component = fixture.componentInstance;
  });

  it('defaults isOpen to false', () => {
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });

  it('emits true when toggled while closed', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();

    let emitted: boolean | undefined;
    component.toggleMenu.subscribe((value) => (emitted = value));

    component.toggleNavbar();

    expect(emitted).toBe(true);
  });

  it('emits false when toggled while open', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    let emitted: boolean | undefined;
    component.toggleMenu.subscribe((value) => (emitted = value));

    component.toggleNavbar();

    expect(emitted).toBe(false);
  });

  it('puts aria-controls on the button itself when a controlled id is given', () => {
    fixture.componentRef.setInput('controls', 'main-nav');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLElement;
    expect(button.getAttribute('aria-controls')).toBe('main-nav');
    expect(fixture.nativeElement.hasAttribute('aria-controls')).toBe(false);
  });

  it('omits aria-controls when no controlled id is given', () => {
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLElement;
    expect(button.hasAttribute('aria-controls')).toBe(false);
  });
});
