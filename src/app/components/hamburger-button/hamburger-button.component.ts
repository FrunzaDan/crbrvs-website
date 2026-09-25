import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-hamburger-button',
  templateUrl: './hamburger-button.component.html',
  styleUrl: './hamburger-button.component.css',
})
export class HamburgerButtonComponent {
  readonly isOpen = input(false);
  readonly controls = input<string>();
  readonly toggleMenu = output<boolean>();

  toggleNavbar(): void {
    this.toggleMenu.emit(!this.isOpen());
  }
}
