import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-hamburger-button',
  templateUrl: './hamburger-button.component.html',
  styleUrls: ['./hamburger-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HamburgerButtonComponent {
  isOpen = input(false);
  controls = input<string>();
  toggleMenu = output<boolean>();

  toggleNavbar() {
    this.toggleMenu.emit(!this.isOpen());
  }
}
