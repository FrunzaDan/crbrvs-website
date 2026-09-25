import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

/** Where the site is published; canonical links and social previews point here. */
export const SITE_URL = 'https://crbrvsraphive.com';

export interface SeoMetaConfig {
  description: string;
  /** The page's path, such as `/404`. */
  path: string;
  /** A picture for link previews, such as `/assets/images/crbrvs_logo.png`. */
  image?: string;
  robots?: string;
  /** The Open Graph locale of the page's text, `en_US` unless given. */
  locale?: string;
}

const DEFAULT_ROBOTS =
  'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  /** Call after the page title is set, since the social title is copied from it. */
  updateMetaTags(config: SeoMetaConfig): void {
    const title = this.document.title;
    const url = SITE_URL + (config.path === '/' ? '' : config.path);

    this.meta.updateTag({ name: 'description', content: config.description });
    this.meta.updateTag({
      name: 'robots',
      content: config.robots ?? DEFAULT_ROBOTS,
    });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({
      property: 'og:description',
      content: config.description,
    });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({
      property: 'og:locale',
      content: config.locale ?? 'en_US',
    });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({
      name: 'twitter:description',
      content: config.description,
    });
    this.meta.updateTag({ name: 'twitter:url', content: url });

    if (config.image) {
      this.meta.updateTag({
        property: 'og:image',
        content: SITE_URL + config.image,
      });
      this.meta.updateTag({
        name: 'twitter:image',
        content: SITE_URL + config.image,
      });
    }

    this.updateCanonicalUrl(url);
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
