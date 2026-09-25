import { NgOptimizedImage, ViewportScroller } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HamburgerButtonComponent } from '../hamburger-button/hamburger-button.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, HamburgerButtonComponent, NgOptimizedImage],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly router = inject(Router);

  readonly isMenuOpen = signal(false);

  scrollToSection(elementId: string): void {
    if (!elementId) {
      console.warn('scrollToSection: Invalid element ID provided.');
      return;
    }
    this.viewportScroller.scrollToAnchor(elementId);
    this.router.navigate([], { fragment: elementId });
    this.closeMenu();
  }

  onToggleMenu(isOpen: boolean): void {
    this.isMenuOpen.set(isOpen);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
