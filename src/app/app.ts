import { Component, DOCUMENT, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly document = inject(DOCUMENT);

  /**
   * Moves focus to the main content in place. Following the `#main-content` link
   * would resolve against `<base href="/">` and open the home page from `/404`.
   */
  skipToMainContent(event: Event): void {
    event.preventDefault();
    this.document.getElementById('main-content')?.focus();
  }
}
