import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-page-not-found',
  imports: [RouterModule],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNotFoundComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateMetaTags({
      description: 'The page you are looking for does not exist or has been moved.',
      ogTitle: '404 - Page Not Found | CRBRVS Rap Hive',
      ogDescription: 'The page you are looking for does not exist or has been moved.',
      canonicalUrl: 'https://crbrvsraphive.com/404',
      robots: 'noindex, nofollow',
    });
  }
}
