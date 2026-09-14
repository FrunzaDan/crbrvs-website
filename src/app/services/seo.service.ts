import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

export interface SeoMetaConfig {
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  canonicalUrl: string;
  robots?: string;
}

const DEFAULT_ROBOTS =
  'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  updateMetaTags(config: SeoMetaConfig): void {
    this.meta.updateTag({ name: 'description', content: config.description });
    this.meta.updateTag({ property: 'og:title', content: config.ogTitle });
    this.meta.updateTag({
      property: 'og:description',
      content: config.ogDescription,
    });
    this.meta.updateTag({ name: 'twitter:title', content: config.ogTitle });
    this.meta.updateTag({
      name: 'twitter:description',
      content: config.ogDescription,
    });

    if (config.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: config.ogImage });
      this.meta.updateTag({ name: 'twitter:image', content: config.ogImage });
    }

    this.meta.updateTag({ property: 'og:url', content: config.canonicalUrl });
    this.meta.updateTag({ name: 'twitter:url', content: config.canonicalUrl });
    this.meta.updateTag({
      name: 'robots',
      content: config.robots ?? DEFAULT_ROBOTS,
    });

    this.updateCanonicalUrl(config.canonicalUrl);
  }

  private updateCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector(
      'link[rel="canonical"]',
    );
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
