import { ViewportScroller } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HamburgerButtonComponent } from '../hamburger-button/hamburger-button.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, HamburgerButtonComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly router = inject(Router);

  isMenuOpen = signal(false);

  public scrollToSection(elementId: string): void {
    if (!elementId) {
      console.warn('scrollToSection: Invalid element ID provided.');
      return;
    }
    this.viewportScroller.scrollToAnchor(elementId);
    this.router.navigate([], { fragment: elementId });
    this.closeMenu();
  }

  onToggleMenu(isOpen: boolean) {
    this.isMenuOpen.set(isOpen);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }
}
