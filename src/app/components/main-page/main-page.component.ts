import { Component, OnInit, inject } from '@angular/core';
import { BackToTopComponent } from '../back-to-top/back-to-top.component';
import { ContactComponent } from '../contact/contact.component';
import { FooterComponent } from '../footer/footer.component';
import { MerchComponent } from '../merch/merch.component';
import { MusicComponent } from '../music/music.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-main-page',
  imports: [
    NavbarComponent,
    MusicComponent,
    MerchComponent,
    ContactComponent,
    FooterComponent,
    BackToTopComponent,
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css',
})
export class MainPageComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      description:
        'Welcome to the official website of Cerga Andrei, known as CRBRVS. Discover his latest music, merch, and connect with him online.',
      path: '/',
      image: '/assets/images/crbrvs_logo.png',
    });
  }
}
