import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPageComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      description:
        "Welcome to the official website of Cerga Andrei, known as CRBRVS. Discover his latest music, merch, and connect with him online.",
      ogTitle: 'CRBRVS Rap Hive',
      ogDescription:
        'The Website of the rapper Cerga Andrei, named CRBRVS, based in Romania. His music, merch and contacts are highlighted.',
      ogImage: 'https://crbrvsraphive.com/assets/images/crbrvs_logo.png',
      canonicalUrl: 'https://crbrvsraphive.com',
    });
  }
}
